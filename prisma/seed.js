// prisma/seed.js — Database seed for ALEYART EXAMAI PRO
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ALEYART ACADEMY database...');

  // ─── SCHOOL CONFIG ───────────────────────────────────────────────────────────
  const configs = [
    { key:'school_name',    value:'ALEYART ACADEMY' },
    { key:'school_motto',   value:'SEEKING WISDOM' },
    { key:'school_address', value:'P.O. Box 123, Accra, Ghana' },
    { key:'school_phone',   value:'+233 24 000 0000' },
    { key:'school_email',   value:'info@aleyartacademy.edu.gh' },
    { key:'school_website', value:'www.aleyartacademy.edu.gh' },
    { key:'academic_year',  value:'2024/2025' },
    { key:'current_term',   value:'Term3' },
    { key:'ges_region',     value:'Greater Accra' },
    { key:'circuit',        value:'Accra Metro Circuit' },
  ];
  for (const cfg of configs) {
    await prisma.schoolConfig.upsert({ where:{ key:cfg.key }, update:{ value:cfg.value }, create:cfg });
  }
  console.log('✅ School config seeded');

  // ─── CLASSES ─────────────────────────────────────────────────────────────────
  const classes = [
    { name:'Creche',    level:'EarlyChildhood',    sortOrder:1  },
    { name:'Nursery 1', level:'EarlyChildhood',    sortOrder:2  },
    { name:'Nursery 2', level:'EarlyChildhood',    sortOrder:3  },
    { name:'KG1',       level:'EarlyChildhood',    sortOrder:4  },
    { name:'KG2',       level:'EarlyChildhood',    sortOrder:5  },
    { name:'Basic 1',   level:'Primary',           sortOrder:6  },
    { name:'Basic 2',   level:'Primary',           sortOrder:7  },
    { name:'Basic 3',   level:'Primary',           sortOrder:8  },
    { name:'Basic 4',   level:'Primary',           sortOrder:9  },
    { name:'Basic 5',   level:'Primary',           sortOrder:10 },
    { name:'Basic 6',   level:'Primary',           sortOrder:11 },
    { name:'Basic 7',   level:'JuniorHighSchool',  sortOrder:12 },
    { name:'Basic 8',   level:'JuniorHighSchool',  sortOrder:13 },
    { name:'Basic 9',   level:'JuniorHighSchool',  sortOrder:14 },
  ];
  for (const cls of classes) {
    await prisma.class.upsert({ where:{ name:cls.name }, update:{}, create:cls });
  }
  console.log('✅ Classes seeded (14 classes)');

  // ─── SUBJECTS ─────────────────────────────────────────────────────────────────
  const subjects = [
    { name:'English Language',         code:'ENG'  },
    { name:'Mathematics',              code:'MATH' },
    { name:'Science',                  code:'SCI'  },
    { name:'Computing',                code:'COMP' },
    { name:'Creative Arts',            code:'CA'   },
    { name:'Creative Arts and Design', code:'CAD'  },
    { name:'RME',                      code:'RME'  },
    { name:'History',                  code:'HIST' },
    { name:'Social Studies',           code:'SS'   },
    { name:'Career Technology',        code:'CT'   },
    { name:'French',                   code:'FRE'  },
    { name:'GA/TWI',                   code:'GHI'  },
  ];
  for (const sub of subjects) {
    await prisma.subject.upsert({ where:{ code:sub.code }, update:{}, create:sub });
  }
  console.log('✅ Subjects seeded (12 subjects)');

  // ─── ADMIN ───────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2025!', 12);
  await prisma.user.upsert({
    where:  { email:'admin@aleyartacademy.edu.gh' },
    update: {},
    create: { staffId:'ADM001', fullName:'System Administrator', email:'admin@aleyartacademy.edu.gh', password:adminPassword, role:'admin', position:'System Administrator' }
  });

  // ─── HEADTEACHER ──────────────────────────────────────────────────────────────
  const htPw = await bcrypt.hash('Headteacher@2025!', 12);
  await prisma.user.upsert({
    where:  { email:'headteacher@aleyartacademy.edu.gh' },
    update: {},
    create: { staffId:'HT001', fullName:'Mrs. Abena Mensah', email:'headteacher@aleyartacademy.edu.gh', password:htPw, role:'headteacher', position:'Headteacher', qualification:'M.Ed. Educational Administration', phone:'+233 24 100 0001' }
  });

  // ─── SAMPLE TEACHERS ─────────────────────────────────────────────────────────
  const teacherData = [
    { staffId:'TCH001', fullName:'Mr. Kofi Boateng',    email:'k.boateng@aleyartacademy.edu.gh',  position:'Mathematics & Science Teacher', subjects:['MATH','SCI'],  classes:['Basic 7','Basic 8','Basic 9'], role:'teacher'     },
    { staffId:'TCH002', fullName:'Ms. Ama Owusu',       email:'a.owusu@aleyartacademy.edu.gh',    position:'English & RME Teacher',         subjects:['ENG','RME'],   classes:['Basic 6','Basic 7','Basic 8','Basic 9'], role:'teacher' },
    { staffId:'TCH003', fullName:'Mr. Yaw Asante',      email:'y.asante@aleyartacademy.edu.gh',   position:'Computing Teacher',             subjects:['COMP','CAD'],  classes:['Basic 5','Basic 6','Basic 7','Basic 8','Basic 9'], role:'teacher' },
    { staffId:'TCH004', fullName:'Mrs. Akua Frimpong',  email:'a.frimpong@aleyartacademy.edu.gh', position:'Primary Class Teacher',         subjects:['ENG','MATH','SCI'], classes:['Basic 1','Basic 2','Basic 3'], role:'teacher' },
    { staffId:'EXO001', fullName:'Mr. Kwame Adjei',     email:'k.adjei@aleyartacademy.edu.gh',    position:'Examination Officer',           subjects:[],              classes:[], role:'examofficer' },
  ];

  for (const t of teacherData) {
    const pw = await bcrypt.hash('Teacher@2025!', 12);
    const user = await prisma.user.upsert({
      where:  { email:t.email },
      update: {},
      create: { staffId:t.staffId, fullName:t.fullName, email:t.email, password:pw, role:t.role, position:t.position, qualification:'B.Ed.' }
    });

    for (const code of t.subjects) {
      const subject = await prisma.subject.findUnique({ where:{ code } });
      if (subject) {
        await prisma.teacherSubject.upsert({
          where:  { userId_subjectId:{ userId:user.id, subjectId:subject.id } },
          update: {},
          create: { userId:user.id, subjectId:subject.id }
        }).catch(() => {});
      }
    }

    for (const className of t.classes) {
      const cls = await prisma.class.findUnique({ where:{ name:className } });
      if (cls) {
        await prisma.teacherClass.upsert({
          where:  { userId_classId:{ userId:user.id, classId:cls.id } },
          update: {},
          create: { userId:user.id, classId:cls.id }
        }).catch(() => {});
      }
    }
  }
  console.log('✅ Teachers seeded');

  // ─── SAMPLE STUDENTS ─────────────────────────────────────────────────────────
  const basic7 = await prisma.class.findUnique({ where:{ name:'Basic 7' } });
  const basic9 = await prisma.class.findUnique({ where:{ name:'Basic 9' } });

  const sampleStudents = [
    { admissionNumber:'2024/001', studentId:'STU2401', fullName:'Kwesi Asare',   gender:'Male',   dob:'2012-03-15', classId:basic7.id },
    { admissionNumber:'2024/002', studentId:'STU2402', fullName:'Akosua Danso',  gender:'Female', dob:'2012-07-22', classId:basic7.id },
    { admissionNumber:'2024/003', studentId:'STU2403', fullName:'Yaw Frimpong',  gender:'Male',   dob:'2010-11-05', classId:basic9.id },
    { admissionNumber:'2024/004', studentId:'STU2404', fullName:'Efua Boateng',  gender:'Female', dob:'2010-01-18', classId:basic9.id },
    { admissionNumber:'2024/005', studentId:'STU2405', fullName:'Nana Adjei',    gender:'Male',   dob:'2012-09-30', classId:basic7.id },
  ];

  for (const s of sampleStudents) {
    await prisma.student.upsert({
      where:  { admissionNumber:s.admissionNumber },
      update: {},
      create: { admissionNumber:s.admissionNumber, studentId:s.studentId, fullName:s.fullName, gender:s.gender, dateOfBirth:new Date(s.dob), classId:s.classId }
    }).catch(() => {});
  }
  console.log('✅ Sample students seeded');

  console.log('\n🎉 Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DEFAULT CREDENTIALS:');
  console.log('  Admin:       admin@aleyartacademy.edu.gh  /  Admin@2025!');
  console.log('  Headteacher: headteacher@aleyartacademy.edu.gh  /  Headteacher@2025!');
  console.log('  Teachers:    [email]  /  Teacher@2025!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  CHANGE ALL PASSWORDS AFTER FIRST LOGIN!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
