import { describe, it, expect } from 'vitest';
import { getIssueCoverUrl, getIssuePdfUrl } from './db';
import type { Issue, Media } from '$lib/types/database';

describe('Issue Helper Utilities', () => {
	const sampleFrontMedia: Media = {
		id: 'media-front',
		created: '2026-09-01T00:00:00Z',
		updated: '2026-09-01T00:00:00Z',
		file: 'front_cover_test.jpg',
		caption: 'Front Cover'
	};

	const sampleBackMedia: Media = {
		id: 'media-back',
		created: '2026-09-01T00:00:00Z',
		updated: '2026-09-01T00:00:00Z',
		file: 'back_cover_test.jpg',
		caption: 'Back Cover'
	};

	const samplePdfMedia: Media = {
		id: 'media-pdf',
		created: '2026-09-01T00:00:00Z',
		updated: '2026-09-01T00:00:00Z',
		file: 'digital_edition.pdf',
		caption: 'Digital PDF'
	};

	const sampleIssue: Issue = {
		id: 'issue-1',
		created: '2026-09-01T00:00:00Z',
		updated: '2026-09-01T00:00:00Z',
		title: 'Issue #06: Neon Noir & Contemporary Midnight Reel',
		price: 15.0,
		publish_date: '2026-09-01T00:00:00Z',
		description: 'A study in dark cityscapes and shadows.',
		front_cover: 'media-front',
		back_cover: 'media-back',
		pdf: 'media-pdf',
		expand: {
			front_cover: sampleFrontMedia,
			back_cover: sampleBackMedia,
			pdf: samplePdfMedia
		}
	};

	it('resolves front cover URL using expanded media record', () => {
		const url = getIssueCoverUrl(sampleIssue, 'front');
		expect(url).toContain('front_cover_test.jpg');
	});

	it('resolves back cover URL using expanded media record', () => {
		const url = getIssueCoverUrl(sampleIssue, 'back');
		expect(url).toContain('back_cover_test.jpg');
	});

	it('resolves direct HTTP front cover URLs', () => {
		const directUrlIssue: Issue = {
			...sampleIssue,
			front_cover: 'https://images.unsplash.com/photo-12345',
			expand: undefined
		};
		const url = getIssueCoverUrl(directUrlIssue, 'front');
		expect(url).toBe('https://images.unsplash.com/photo-12345');
	});

	it('resolves PDF URL from expanded media', () => {
		const pdfUrl = getIssuePdfUrl(sampleIssue);
		expect(pdfUrl).toContain('digital_edition.pdf');
	});

	it('resolves direct pdf_url field when provided', () => {
		const directPdfIssue: Issue = {
			...sampleIssue,
			pdf_url: 'https://s3.amazonaws.com/media-bucket/issue-06.pdf',
			expand: undefined
		};
		const pdfUrl = getIssuePdfUrl(directPdfIssue);
		expect(pdfUrl).toBe('https://s3.amazonaws.com/media-bucket/issue-06.pdf');
	});

	it('returns null gracefully when no cover or PDF is provided', () => {
		const emptyIssue: Issue = {
			id: 'issue-empty',
			created: '',
			updated: '',
			title: 'Empty Issue',
			price: 10,
			publish_date: '2026-09-01T00:00:00Z'
		};
		expect(getIssueCoverUrl(emptyIssue, 'front')).toBeNull();
		expect(getIssueCoverUrl(emptyIssue, 'back')).toBeNull();
		expect(getIssuePdfUrl(emptyIssue)).toBeNull();
	});
});
