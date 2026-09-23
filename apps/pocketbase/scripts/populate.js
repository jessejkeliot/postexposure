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

async function populateMedia(count = 40) {
  console.log(`Seeding ${count} bits of media...`);
  const mediaRecords = [];

  for (let i = 0; i < count; i++) {
    try {
      const caption = faker.lorem.sentence(5);
      const response = await fetch(`https://picsum.photos/seed/${faker.helpers.slugify(caption)}/800/500`);
      const imageBlob = await response.blob();
      const formData = new FormData();
      formData.append('file', imageBlob, `picsum_image_${i}.jpg`);
      formData.append('caption', faker.lorem.sentence());
      formData.append('type', i % 2 === 0 ? 'poster' : 'banner');

      const createdRecord = await pb.collection('media').create(formData);
      mediaRecords.push(createdRecord);
    } catch (err) {
      console.error(`Failed seeding media item ${i}:`, err.message);
    }
  }

  return mediaRecords;
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

async function populateArticles(categories, authors, mediaList, count = 30) {
  console.log(`Seeding ${count} articles...`);
  const articles = [];
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence({ min: 4, max: 8 }).replace(/\.$/, '');
    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`;
    const category = faker.helpers.arrayElement(categories);
    const author = faker.helpers.arrayElement(authors);
    const selectedMedia = mediaList && mediaList.length > 0 ? faker.helpers.arrayElement(mediaList) : null;

    const paragraphs = faker.lorem.paragraphs({ min: 3, max: 6 }, '</p><p>');
    const content = `<p>${paragraphs}</p>`;

    const article = await pb.collection('articles').create({
      title,
      slug,
      excerpt: faker.lorem.paragraph(),
      content,
      cover_image: selectedMedia ? selectedMedia.id : null,
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
      title: `${faker.word.adjective().toUpperCase()}`,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      description: faker.lorem.paragraph()
    });
    seasons.push(season);
  }
  return seasons;
}
async function populateAbout() {
  console.log(`Seeding about section`);

    const about = await pb.collection('about').create({
      content: `<h3>*This is a placeholder about section*</h3><p>${faker.lorem.paragraph()}</p>`,
      published_at: faker.date.recent({ days: 60 }).toISOString()
    });
  }

async function populateFilmsAndScreenings(mediaList, seasons, count = 8) {
  console.log(`Seeding ${count} films and screenings...`);
  const films = [];
  for (let i = 0; i < count; i++) {
    const releaseDate = faker.date.past({ years: 50 });
    const selectedMedia = mediaList && mediaList.length > 0 ? faker.helpers.arrayElement(mediaList) : null;
    const film = await pb.collection('films').create({
      title: faker.music.songName(),
      director: faker.person.fullName(),
      release_date: releaseDate.toISOString(),
      description: faker.lorem.paragraph(),
      cover_image: selectedMedia ? selectedMedia.id : null,
    });
    films.push(film);
    const season = faker.helpers.arrayElement(seasons);
    // Create 1-3 screenings for each film
    const screeningCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < screeningCount; j++) {
      const showDate = faker.date.soon({ days: 90 });
      const totalTickets = faker.helpers.arrayElement([40, 50, 60, 80, 100]);
      const ticketsSold = faker.number.int({ min: 0, max: totalTickets });
      await pb.collection('screenings').create({
        film: film.id,
        season: season.id,
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

async function populateIssues(mediaList, count = 6) {
  console.log(`Seeding ${count} magazine issues...`);
  const issueThemes = [
    {
      title: 'Issue #06: Neon Noir & The Contemporary Midnight Reel',
      description: 'An exploration of modern neo-noir, shadow puppetry in digital cinematography, and exclusive interviews with indie cinematographers shaping modern nightscapes.',
      price: 15.00
    },
    {
      title: 'Issue #05: Analog Dreams — The Celluloid Renaissance',
      description: 'Why 35mm and 16mm film stock are experiencing a cultural resurgence. Featuring archival essays, darkroom deep dives, and director roundtable discussions.',
      price: 14.00
    },
    {
      title: 'Issue #04: The Architecture of Cinematic Suspense',
      description: 'Dissecting pacing, blocking, and spatial geometry in thriller masterpieces from Hitchcock to contemporary psychological cinema.',
      price: 12.50
    },
    {
      title: 'Issue #03: Voices From The Underground (1975–1989)',
      description: 'A retrospective on underground collective filmmaking, DIY distribution networks, and rare poster archives.',
      price: 12.00
    },
    {
      title: 'Issue #02: Sonic Landscapes: Sound Design as Narrative',
      description: 'From concrete music to granular synthesis — how pioneering audio engineers sculpt cinematic tension and emotional resonance.',
      price: 10.50
    },
    {
      title: 'Issue #01: Inaugural Edition — The Future of the Moving Image',
      description: 'The debut issue of Post Exposure. Essays on cinema exhibition, film preservation, and radical emerging visions.',
      price: 10.00
    }
  ];

  const issues = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, issueThemes.length); i++) {
    const theme = issueThemes[i];
    // Dates spaced out backwards (latest is recent)
    const pubDate = new Date(now.getTime() - i * 60 * 24 * 60 * 60 * 1000);

    const frontMedia = mediaList && mediaList.length > 0 ? mediaList[(i * 2) % mediaList.length] : null;
    const backMedia = mediaList && mediaList.length > 0 ? mediaList[(i * 2 + 1) % mediaList.length] : null;

    // Create a mock PDF media record for the issue
    let pdfMedia = null;
    try {
      const mockPdfContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF`;
      const pdfBlob = new Blob([mockPdfContent], { type: 'application/pdf' });
      const pdfFormData = new FormData();
      pdfFormData.append('file', pdfBlob, `post_exposure_issue_0${6 - i}.pdf`);
      pdfFormData.append('caption', `Digital Edition PDF - ${theme.title}`);
      pdfFormData.append('type', 'pdf');
      pdfMedia = await pb.collection('media').create(pdfFormData);
    } catch (err) {
      console.warn(`Could not seed PDF media for issue ${i + 1}:`, err.message);
    }

    try {
      const issue = await pb.collection('issues').create({
        title: theme.title,
        price: theme.price,
        description: theme.description,
        publish_date: pubDate.toISOString(),
        front_cover: frontMedia ? frontMedia.id : null,
        back_cover: backMedia ? backMedia.id : null,
        pdf: pdfMedia ? pdfMedia.id : null
      });
      issues.push(issue);
    } catch (err) {
      console.error(`Failed to create issue "${theme.title}":`, err.message);
    }
  }

  return issues;
}

async function main() {
  console.log(`Connecting to PocketBase at ${pbUrl}...`);
  await authenticate();
  console.log('Authenticated successfully.');
  const media = await populateMedia(40);
  const about = await populateAbout();
  const categories = await populateCategories();
  const authors = await populateAuthors(6);
  await populateArticles(categories, authors, media, 15);
  const seasons = await populateSeasons(3);
  await populateFilmsAndScreenings(media, seasons, 18);
  await populateIssues(media, 6);

  console.log('Database population completed successfully!');
}

main().catch((err) => {
  console.error('Population script failed:', err);
  process.exit(1);
});
