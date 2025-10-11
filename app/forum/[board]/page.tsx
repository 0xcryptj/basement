import Link from 'next/link';
import ThreadCard from '@/components/forum/ThreadCard';
import NewThreadForm from '@/components/forum/NewThreadForm';
import { BOARD_INFO } from '@/lib/forum/constants';

async function getThreads(boardSlug: string, page: number = 1) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL || 'http://localhost:8000'}/api/forum/threads?board=${boardSlug}&page=${page}`,
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch threads');
  }

  return res.json();
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { board: boardSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');

  const { threads, pagination } = await getThreads(boardSlug, page);
  const boardInfo = BOARD_INFO[boardSlug];

  if (!boardInfo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#AF0A0F] mb-4">Board Not Found</h2>
        <Link href="/forum" className="text-[#34345C] hover:underline">
          ← Back to Boards
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Board Header - 4chan style */}
      <div className="mb-4 text-center">
        <div className="text-2xl font-bold text-[#AF0A0F] mb-1">
          /{boardSlug}/ - {boardInfo.title}
        </div>
        <div className="text-xs text-gray-600 mb-2">{boardInfo.about}</div>
        <div className="text-xs">
          <Link href="/forum" className="text-[#34345C] hover:underline mr-2">
            [Home]
          </Link>
          <Link href={`/forum/${boardSlug}/catalog`} className="text-[#34345C] hover:underline mr-2">
            [Catalog]
          </Link>
          <span className="text-gray-500">Page {page} of {pagination.totalPages || 1}</span>
        </div>
      </div>

      {/* New Thread Form */}
      <div className="mb-6">
        <NewThreadForm boardSlug={boardSlug} />
      </div>

      <hr className="border-[#B7C5D9] my-4" />

      {/* Thread List */}
      <div>
        {threads.length === 0 ? (
          <div className="text-center py-12 bg-[#F0E0D6] border border-[#D9BFB7]">
            <p className="text-gray-600">No threads yet. Be the first to post!</p>
          </div>
        ) : (
          threads.map((thread: any) => (
            <ThreadCard key={thread.id} thread={thread} boardSlug={boardSlug} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 text-center">
          <hr className="border-[#B7C5D9] mb-3" />
          <div className="flex items-center justify-center gap-2 text-sm">
            {page > 1 && (
              <>
                <Link
                  href={`/forum/${boardSlug}`}
                  className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
                >
                  First
                </Link>
                <Link
                  href={`/forum/${boardSlug}?page=${page - 1}`}
                  className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
                >
                  Previous
                </Link>
              </>
            )}

            <span className="px-3 py-1 font-semibold">
              {page}
            </span>

            {page < pagination.totalPages && (
              <>
                <Link
                  href={`/forum/${boardSlug}?page=${page + 1}`}
                  className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
                >
                  Next
                </Link>
                <Link
                  href={`/forum/${boardSlug}?page=${pagination.totalPages}`}
                  className="px-3 py-1 bg-[#D6DAF0] border border-[#B7C5D9] hover:bg-[#EEDAC2] transition-colors"
                >
                  Last
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <hr className="border-[#B7C5D9] my-4" />
    </div>
  );
}

