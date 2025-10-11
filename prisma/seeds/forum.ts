import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding forum boards...');

  // Create boards
  const boards = [
    {
      slug: 'g',
      title: 'Technology',
      about: 'Technology discussion board',
    },
    {
      slug: 'biz',
      title: 'Business & Finance',
      about: 'Discussion about business, crypto, and finance',
    },
    {
      slug: 'a',
      title: 'Anime & Manga',
      about: 'Anime and manga discussion',
    },
    {
      slug: 'b',
      title: 'Random',
      about: 'Random discussion - anything goes (within rules)',
    },
  ];

  for (const boardData of boards) {
    const board = await prisma.board.upsert({
      where: { slug: boardData.slug },
      update: {},
      create: boardData,
    });

    // Create welcome/rules thread for each board
    await prisma.thread.upsert({
      where: { id: `welcome-${board.slug}` },
      update: {},
      create: {
        id: `welcome-${board.slug}`,
        boardId: board.id,
        subject: 'Welcome to /' + board.slug + '/ - Rules & Guidelines',
        opText: `Welcome to /${board.slug}/ - ${board.title}!

Rules:
1. No illegal content (CSAM, threats, doxxing, etc.)
2. Stay on topic when possible
3. Be respectful to other anons
4. No spam or excessive posting
5. NSFW content must be spoilered (if applicable)

Features:
- Post anonymously with wallet authentication
- Daily rotating anon IDs for same-poster identification
- Optional tripcodes for consistent identity
- Image uploads supported (jpg, png, gif, webp)
- Use 'sage' to reply without bumping threads

Enjoy your stay in The Basement!`,
        anonId: 'Admin',
        tripSig: null,
        isSticky: true,
        isLocked: false,
      },
    });

    console.log(`Created board: /${board.slug}/ - ${board.title}`);
  }

  console.log('Forum seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

