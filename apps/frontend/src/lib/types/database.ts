export interface Category {
	id: string;
	created: string;
	updated: string;
	name: string;
	slug: string;
}

export interface Author {
	id: string;
	created: string;
	updated: string;
	name: string;
	bio?: string;
	avatar?: string;
}

export interface Media {
	id: string;
	created: string;
	updated: string;
	file: string;
	caption?: string;
	type?: 'poster' | 'still' | 'banner' | 'thumbnail' | string;
}

export interface Article {
	id: string;
	created: string;
	updated: string;
	title: string;
	slug: string;
	excerpt?: string;
	content?: string;
	cover_image?: string;
	category: string;
	author: string;
	is_paywalled?: boolean;
	published_at?: string;
	expand?: {
		category?: Category;
		author?: Author;
		cover_image?: Media;
	};
}

export interface Season {
	id: string;
	created: string;
	updated: string;
	title: string;
	start_date: string;
	end_date: string;
	description?: string;
}

export interface Film {
	id: string;
	created: string;
	updated: string;
	title: string;
	director: string;
	release_date: string;
	description?: string;
	cover_image?: string;
	expand?: {
		cover_image?: Media;
	};
}

export interface Screening {
	id: string;
	created: string;
	updated: string;
	film: string;
	season: string;
	showing_date: string;
	showing_time: string;
	total_tickets?: number;
	tickets_sold?: number;
	tickets_available?: number;
	expand?: {
		film?: Film;
		season?: Season;
	};
}

export interface Ticket {
	id: string;
	created: string;
	updated: string;
	screening: string;
	user: string;
	status?: string;
	expand?: {
		screening?: Screening;
		user?: unknown;
	};
}

export interface About {
	content: string;
	published_at?: string;
	created: string;
	updated: string;
}

export interface Issue {
	id: string;
	created: string;
	updated: string;
	title: string;
	price: number;
	publish_date: string;
	description?: string;
	front_cover?: string;
	back_cover?: string;
	pdf?: string;
	pdf_url?: string;
	expand?: {
		front_cover?: Media;
		back_cover?: Media;
		pdf?: Media;
	};
}
