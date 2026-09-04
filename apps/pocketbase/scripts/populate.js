import PocketBase from 'pocketbase';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or apps/pocketbase
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@magazine.com';
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || '12345678910';

const pb = new PocketBase(pbUrl);

async function authenticate() {
  try {
    // In PB 0.23+, superusers are authenticated via _superusers collection or authWithPassword
    if (pb.collection('_superusers')) {
      try {
        await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
        return;
      } catch (err) {
        // fallback to admins if superusers fail
      }
    }
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (err) {
    console.error('Failed to authenticate as admin/superuser. Make sure PocketBase is running and admin credentials are valid.');
    console.error(err);
    process.exit(1);
  }
}

async function populateCategories() {
  console.log('Seeding categories...');
  const categoryNames = [
    'Film Review',
    'Interview',
    'Report',
    'Essay',
  ];

  const categories = [];
  for (const name of categoryNames) {
    const slug = faker.helpers.slugify(name).toLowerCase();
    try {
      // Check if existing
      const existing = await pb.collection('categories').getFirstListItem(`slug="${slug}"`).catch(() => null);
      if (existing) {
        categories.push(existing);
      } else {
        const created = await pb.collection('categories').create({
          name,
          slug
        });
        categories.push(created);
      }
    } catch (err) {
      console.error(`Error creating category ${name}:`, err.message);
    }
  }
  return categories;
}

async function populateAuthors(count = 8) {
  console.log(`Seeding ${count} authors...`);
  const authors = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const author = await pb.collection('authors').create({
      name: `${firstName} ${lastName}`,
      bio: faker.person.bio()
    });
    authors.push(author);
  }
  return authors;
}

async function populateArticles(categories, authors, count = 30) {
  console.log(`Seeding ${count} articles...`);
  const articles = [];
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence({ min: 4, max: 8 }).replace(/\.$/, '');
    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`;
    const category = faker.helpers.arrayElement(categories);
    const author = faker.helpers.arrayElement(authors);

    const paragraphs = faker.lorem.paragraphs({ min: 3, max: 6 }, '</p><p>');
    const content = `<p>${paragraphs}</p>`;

    const article = await pb.collection('articles').create({
      title,
      slug,
      excerpt: faker.lorem.paragraph(),
      content,
      cover_image: `https://picsum.photos/seed/${slug}/800/500`,
      category: category.id,
      author: author.id,
      is_paywalled: faker.datatype.boolean({ probability: 0.3 }),
      published_at: faker.date.recent({ days: 60 }).toISOString()
    });
    articles.push(article);
  }
  return articles;
}

async function populateSeasons(count = 3) {
  console.log(`Seeding ${count} seasons...`);
  const seasons = [];
  for (let i = 0; i < count; i++) {
    const startDate = faker.date.soon({ days: (i + 1) * 30 });
    const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 28); // 4 weeks later

    const season = await pb.collection('seasons').create({
      title: `${faker.word.adjective().toUpperCase()} CINEMA: Season ${i + 1}`,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      description: faker.lorem.paragraph()
    });
    seasons.push(season);
  }
  return seasons;
}

async function populateFilmsAndScreenings(count = 8) {
  console.log(`Seeding ${count} films and screenings...`);
  const films = [];
  for (let i = 0; i < count; i++) {
    const releaseDate = faker.date.past({ years: 50 });
    const film = await pb.collection('films').create({
      title: faker.music.songName() + ' (' + releaseDate.getFullYear() + ')',
      director: faker.person.fullName(),
      release_date: releaseDate.toISOString(),
      description: faker.lorem.paragraph()
    });
    films.push(film);

    // Create 1-3 screenings for each film
    const screeningCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < screeningCount; j++) {
      const showDate = faker.date.soon({ days: 90 });
      const totalTickets = faker.helpers.arrayElement([40, 50, 60, 80, 100]);
      const ticketsSold = faker.number.int({ min: 0, max: totalTickets });
      await pb.collection('screenings').create({
        film: film.id,
        showing_date: showDate.toISOString(),
        showing_time: showDate.toISOString(),
        total_tickets: totalTickets,
        tickets_sold: ticketsSold,
        tickets_available: totalTickets - ticketsSold
      });
    }
  }
  return films;
}

async function main() {
  console.log(`Connecting to PocketBase at ${pbUrl}...`);
  await authenticate();
  console.log('Authenticated successfully.');

  const categories = await populateCategories();
  const authors = await populateAuthors(6);
  await populateArticles(categories, authors, 15);
  await populateSeasons(3);
  await populateFilmsAndScreenings(8);

  console.log('Database population completed successfully!');
}

main().catch((err) => {
  console.error('Population script failed:', err);
  process.exit(1);
});
