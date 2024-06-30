import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    });
    users.push(user);
  }

  // Create recordings
  for (const user of users) {
    for (let j = 0; j < 3; j++) {
      await prisma.recording.create({
        data: {
          title: faker.lorem.words(3),
          url: faker.internet.url(),
          isPublic: faker.datatype.boolean(),
          userId: user.id,
        },
      });
    }
  }

  // Create unique followers
  for (let i = 0; i < 20; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);

    if (follower.id !== following.id) {
      const exists = await prisma.follower.findUnique({
        where: {
          followerId_followingId: {
            followerId: follower.id,
            followingId: following.id,
          },
        },
      });

      if (!exists) {
        await prisma.follower.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        });
      }
    }
  }

  // Create likes and comments
  const recordings = await prisma.recording.findMany();
  for (const recording of recordings) {
    const user = faker.helpers.arrayElement(users);

    // Create like
    await prisma.recordingLike.create({
      data: {
        userId: user.id,
        recordingId: recording.id,
      },
    });

    // Create comment
    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        userId: user.id,
        recordingId: recording.id,
      },
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
