import type { PageServerLoad } from './$types';
import {getRecentAbout } from '$lib/pocketbase/db';
import type { About } from '$lib';

export const load: PageServerLoad = async () => {
    const about: About = await getRecentAbout();

    return {
        about
    };
};