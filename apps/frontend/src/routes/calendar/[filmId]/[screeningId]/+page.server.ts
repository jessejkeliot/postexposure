import { error } from '@sveltejs/kit';
import { getFilmById, getScreeningById, getScreeningsBySeason } from '$lib/pocketbase/db';
import type { PageServerLoad } from './$types';
import type { Screening } from '$lib/types/database';

export const load: PageServerLoad = async ({ params }) => {
    // could be that it splits the 
    const film = await getFilmById(params.filmId);
    if (!film) {
		error(404, 'Film not found');
	}
    const screening = await getScreeningById(params.screeningId);

    if (!screening) {
        error(404, 'Screening not found');
    }

    // TODO: Fetch films in the same season 
    let moreScreenings: Screening[] = [];
    try {
        const seasonScreenings = await getScreeningsBySeason(screening);
        moreScreenings = seasonScreenings.filter((a) => a.film !== film.id);
    } catch {
        console.warn("No other screenings for this season were found");
    }
    return {
        film,
        screening,
        moreScreenings
    };
};
