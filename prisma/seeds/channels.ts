import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChannels() {
  console.log('🌱 Seeding channels...');

  // Create default chat channels
  const channels = [
    {
      name: 'General',
      slug: 'general',
      description: 'General discussion and welcome area',
      isPrivate: false,
    },
    {
      name: 'Trading',
      slug: 'trading',
      description: 'Crypto trading, tips, and market discussion',
      isPrivate: false,
    },
    {
      name: 'Web3 Dev',
      slug: 'web3-dev',
      description: 'Smart contracts, DApps, and blockchain development',
      isPrivate: false,
    },
    {
      name: 'NFT Gallery',
      slug: 'nft-gallery',
      description: 'Share and discuss NFTs',
      isPrivate: false,
    },
    {
      name: 'Arcade',
      slug: 'arcade',
      description: 'Gaming, high scores, and challenges',
      isPrivate: false,
    },
    {
      name: 'VIP Lounge',
      slug: 'vip',
      description: 'Exclusive channel for verified members',
      isPrivate: true,
      maxMembers: 100,
    },
  ];

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { slug: channel.slug },
      update: {},
      create: channel,
    });
    console.log(`✅ Created channel: ${channel.name}`);
  }

  console.log('✨ Channel seeding complete!');
}

seedChannels()
  .catch((e) => {
    console.error('❌ Error seeding channels:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

