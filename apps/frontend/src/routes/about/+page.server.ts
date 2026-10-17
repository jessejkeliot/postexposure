import type { PageServerLoad } from './$types';
import { getRecentAbout } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
    const about = await getRecentAbout(locals.pb);

    return {
        about
    };
};