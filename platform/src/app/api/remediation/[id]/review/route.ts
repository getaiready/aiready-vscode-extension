import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemediation, updateRemediation } from '@/lib/db/remediation';

/**
 * Expert Review Endpoint
 * POST /api/remediation/[id]/review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { comment, decision } = (await req.json()) as {
      comment: string;
      decision: 'approve' | 'request-changes';
    };

    if (!decision) {
      return NextResponse.json(
        { error: 'Decision is required' },
        { status: 400 }
      );
    }

    const remediationId = params.id;
    const remediation = await getRemediation(remediationId);

    if (!remediation) {
      return NextResponse.json(
        { error: 'Remediation not found' },
        { status: 404 }
      );
    }

    const update: any = {
      reviewFeedback: {
        userId: session.user.id,
        comment,
        decision,
        timestamp: new Date().toISOString(),
      },
    };

    if (decision === 'approve') {
      update.status = 'approved';
      update.agentStatus = 'Expert approved. Preparing Pull Request...';

      // Simulate PR trigger
      setTimeout(async () => {
        await updateRemediation(remediationId, {
          status: 'pr-created',
          prUrl: `https://github.com/aiready/demo/pull/${Math.floor(Math.random() * 1000)}`,
          agentStatus: 'Remediation successfully merged to main.',
        });
      }, 3000);
    } else {
      update.status = 'in-progress';
      update.agentStatus = `Expert requested changes: "${comment.substring(0, 50)}..."`;

      // Simulate iteration
      setTimeout(async () => {
        await updateRemediation(remediationId, {
          status: 'reviewing',
          agentStatus:
            'Agent has incorporated expert feedback. Ready for re-review.',
          suggestedDiff: '--- modified code with feedback updates ---',
        });
      }, 5000);
    }

    await updateRemediation(remediationId, update);

    return NextResponse.json({ success: true, status: update.status });
  } catch (error) {
    console.error('[ReviewAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
