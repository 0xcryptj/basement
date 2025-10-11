import Link from 'next/link';
import Image from 'next/image';
import { BOARD_INFO } from '@/lib/forum/constants';

async function getThreads(boardSlug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL || 'http://localhost:8000'}/api/forum/threads?board=${boardSlug}&page=1&limit=150`,
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch threads');
  }

  return res.json();
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const { board: boardSlug } = await params;
  const { threads } = await getThreads(boardSlug);
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
      {/* Board Header */}
      <div className="mb-4 text-center">
        <div className="text-2xl font-bold text-[#AF0A0F] mb-1">
          /{boardSlug}/ - {boardInfo.title}
        </div>
        <div className="text-xs text-gray-600 mb-2">{boardInfo.about}</div>
        <div className="text-xs">
          <Link href="/forum" className="text-[#34345C] hover:underline mr-2">
            [Home]
          </Link>
          <Link href={`/forum/${boardSlug}`} className="text-[#34345C] hover:underline mr-2">
            [Return]
          </Link>
          <span className="font-semibold">Catalog</span>
        </div>
      </div>

      <hr className="border-[#B7C5D9] my-4" />

      {/* Catalog Grid */}
      {threads.length === 0 ? (
        <div className="text-center py-12 bg-[#F0E0D6] border border-[#D9BFB7]">
          <p className="text-gray-600">No threads yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {threads.map((thread: any) => (
            <CatalogItem key={thread.id} thread={thread} boardSlug={boardSlug} />
          ))}
        </div>
      )}

      <hr className="border-[#B7C5D9] my-4" />
    </div>
  );
}

interface CatalogItemProps {
  thread: any;
  boardSlug: string;
}

function CatalogItem({ thread, boardSlug }: CatalogItemProps) {
  const formatTextPreview = (text: string, maxLen: number = 100) => {
    const stripped = text.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
    return stripped.length > maxLen ? stripped.slice(0, maxLen) + '...' : stripped;
  };

  return (
    <Link
      href={`/forum/${boardSlug}/thread/${thread.id}`}
      className="catalog-thread block"
    >
      {/* Sticky/Locked badges */}
      {(thread.isSticky || thread.isLocked) && (
        <div className="mb-1 flex gap-1 justify-center">
          {thread.isSticky && (
            <span className="px-1 text-xs font-bold bg-red-600 text-white">
              📌
            </span>
          )}
          {thread.isLocked && (
            <span className="px-1 text-xs font-bold bg-yellow-600 text-white">
              🔒
            </span>
          )}
        </div>
      )}

      {/* Thumbnail */}
      {thread.opThumbUrl ? (
        <div className="mb-2 flex justify-center">
          <Image
            src={thread.opThumbUrl}
            alt="Thread"
            width={150}
            height={150}
            className="object-cover border border-[#D9BFB7]"
            style={{ maxWidth: '150px', maxHeight: '150px' }}
            unoptimized
          />
        </div>
      ) : (
        <div className="mb-2 flex justify-center items-center bg-[#D6DAF0] border border-[#D9BFB7]"
             style={{ width: '150px', height: '150px' }}>
          <span className="text-6xl">📝</span>
        </div>
      )}

      {/* Subject */}
      {thread.subject && (
        <div className="text-xs font-bold text-[#0F0C5D] mb-1 line-clamp-2">
          {thread.subject}
        </div>
      )}

      {/* Text preview */}
      <div className="text-xs text-gray-700 mb-2 line-clamp-3">
        {formatTextPreview(thread.opText)}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-600">
        <span className="font-semibold">R: {thread._count?.posts || 0}</span>
        {thread.opImageUrl && <span className="ml-1">/ I: 1</span>}
      </div>
    </Link>
  );
}

