import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Test database connection and check tables
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const channelCount = await prisma.channel.count();
    const userCount = await prisma.user.count();
    const messageCount = await prisma.message.count();
    
    console.log(`📊 Tables found: ${channelCount} channels, ${userCount} users, ${messageCount} messages`);
    
    // Get list of channels
    const channels = await prisma.channel.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Chat API is working!',
      database: {
        connected: true,
        tables: {
          channels: channelCount,
          users: userCount,
          messages: messageCount
        }
      },
      sampleChannels: channels,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

