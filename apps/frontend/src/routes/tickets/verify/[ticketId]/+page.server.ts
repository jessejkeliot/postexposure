import type { PageServerLoad } from './$types';
import { getTicketById, scanTicket } from '$lib/pocketbase/db';
import type { Ticket } from '$lib/types/database';

export type VerificationResult =
	| {
			status: 'UNAUTHORIZED';
			message: string;
	  }
	| {
			status: 'NOT_FOUND';
			ticketId: string;
			message: string;
	  }
	| {
			status: 'ALREADY_SCANNED';
			ticket: Ticket;
			scannedAt: string;
			message: string;
	  }
	| {
			status: 'ACCEPTED';
			ticket: Ticket;
			scannedAt: string;
			message: string;
	  };

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const ticketId = params.ticketId;

	// 1. Guard: Scanner device must be authenticated as Admin
	if (!locals.user) {
		return {
			result: {
				status: 'UNAUTHORIZED',
				message: 'Admin authentication required to scan and verify tickets.'
			} as VerificationResult,
			adminUser: null,
			loginRedirect: `/login?redirect=${encodeURIComponent(url.pathname)}`
		};
	}

	if (locals.user.role !== 'admin') {
		return {
			result: {
				status: 'UNAUTHORIZED',
				message: 'Access denied: Your account does not have Admin / Venue Curator permissions.'
			} as VerificationResult,
			adminUser: locals.user,
			loginRedirect: `/login?redirect=${encodeURIComponent(url.pathname)}`
		};
	}

	// 2. Fetch ticket details
	const existingTicket = await getTicketById(ticketId, locals.pb);

	if (!existingTicket) {
		return {
			result: {
				status: 'NOT_FOUND',
				ticketId,
				message: 'Ticket not found in the database. This code is invalid or counterfeit.'
			} as VerificationResult,
			adminUser: locals.user
		};
	}

	// 3. Check if already scanned
	if (existingTicket.scanned_at || existingTicket.status === 'used') {
		return {
			result: {
				status: 'ALREADY_SCANNED',
				ticket: existingTicket,
				scannedAt: existingTicket.scanned_at || existingTicket.updated,
				message: 'This ticket has already been used and cannot be admitted again.'
			} as VerificationResult,
			adminUser: locals.user
		};
	}

	// 4. Ticket is valid and untouched: Mark as scanned and accepted!
	const scanResult = await scanTicket(ticketId, locals.pb);

	if (!scanResult.success && scanResult.alreadyScanned) {
		return {
			result: {
				status: 'ALREADY_SCANNED',
				ticket: scanResult.ticket || existingTicket,
				scannedAt: scanResult.ticket?.scanned_at || new Date().toISOString(),
				message: 'This ticket was just scanned or has already been used.'
			} as VerificationResult,
			adminUser: locals.user
		};
	}

	const confirmedTicket = scanResult.ticket || existingTicket;
	const timestamp = confirmedTicket.scanned_at || new Date().toISOString();

	return {
		result: {
			status: 'ACCEPTED',
			ticket: confirmedTicket,
			scannedAt: timestamp,
			message: 'Ticket successfully verified and admitted.'
		} as VerificationResult,
		adminUser: locals.user
	};
};
