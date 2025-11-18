import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test profiles and pets
  const testUsers = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'ghostmaster',
      petName: 'Casper',
      level: 5,
      experience: 450,
      hunger: 85,
      mood: 90,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'spooky_friend',
      petName: 'Boo',
      level: 3,
      experience: 280,
      hunger: 60,
      mood: 75,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      username: 'phantom_keeper',
      petName: 'Phantom',
      level: 7,
      experience: 650,
      hunger: 95,
      mood: 100,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      username: null, // Anonymous user
      petName: 'Whisper',
      level: 2,
      experience: 150,
      hunger: 40,
      mood: 50,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      username: 'ecto_enthusiast',
      petName: 'Ecto',
      level: 4,
      experience: 380,
      hunger: 70,
      mood: 85,
    },
  ]

  for (const user of testUsers) {
    // Create profile
    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        username: user.username,
      },
    })

    console.log(`✅ Created profile: ${user.username || 'Anonymous'}`)

    // Create pet
    const pet = await prisma.pet.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: user.petName,
        level: user.level,
        experience: user.experience,
        hunger: user.hunger,
        mood: user.mood,
        lastFedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        lastPlayedAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000), // Random time in last 12h
      },
    })

    console.log(`✅ Created pet: ${pet.name} (Level ${pet.level})`)

    // Create some sample messages
    const sampleMessages = [
      { sender: 'user', message: 'Hello! How are you?' },
      { sender: 'ghost', message: `Boo! 👻 I'm doing great! Thanks for asking!` },
      { sender: 'user', message: 'Want to play?' },
      { sender: 'ghost', message: `I'd love to! Let's have some spooky fun! 🎃` },
    ]

    for (const msg of sampleMessages) {
      await prisma.message.create({
        data: {
          petId: pet.id,
          sender: msg.sender,
          message: msg.message,
        },
      })
    }

    console.log(`✅ Created ${sampleMessages.length} messages for ${pet.name}`)
  }

  console.log('\n🎉 Seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`   - ${testUsers.length} profiles created`)
  console.log(`   - ${testUsers.length} pets created`)
  console.log(`   - ${testUsers.length * 4} messages created`)
  console.log('\n🏆 Leaderboard preview:')
  
  const topPets = await prisma.pet.findMany({
    take: 5,
    orderBy: [
      { level: 'desc' },
      { experience: 'desc' },
    ],
    include: {
      profile: {
        select: {
          username: true,
        },
      },
    },
  })

  topPets.forEach((pet, index) => {
    console.log(
      `   ${index + 1}. ${pet.name} - Level ${pet.level} (${pet.experience} XP) - Owner: ${pet.profile?.username || 'Anonymous'}`
    )
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
