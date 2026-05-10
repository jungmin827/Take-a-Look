import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const prisma = new PrismaClient();

async function checkConnections() {
  console.log('=== 데이터베이스 및 Supabase 연결 테스트 ===\n');

  try {
    // 1. Supabase 연결 테스트 (Storage 버킷 정보 가져오기)
    console.log('1. Supabase 연결 테스트 중...');
    const { data, error } = await supabase.storage.getBucket('covers');
    if (error) {
      if (error.message.includes('Bucket not found') || error.message.includes('The resource was not found')) {
        console.log('✅ Supabase 연결 성공 (URL 및 Key 정상 작동, 단 covers 버킷은 아직 생성되지 않았을 수 있습니다.)');
      } else {
        console.error('❌ Supabase 연결 실패:', error.message);
      }
    } else {
      console.log('✅ Supabase 연결 성공 (Storage 버킷 접근 가능)');
    }
  } catch (err) {
    console.error('❌ Supabase 연결 중 예외 발생:', err);
  }

  console.log('\n----------------------------------------\n');

  try {
    // 2. SQLite (Prisma) 연결 테스트
    console.log('2. SQLite (Prisma) 연결 테스트 중...');
    const userCount = await prisma.essay.count();
    console.log(`✅ SQLite DB 연결 성공 (현재 저장된 에세이 수: ${userCount}개)`);
  } catch (err) {
    console.error('❌ SQLite DB 연결 실패:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnections();
