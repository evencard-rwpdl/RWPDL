import { round, score } from './score.js';

/**
 * Path to directory containing `list.json` and all levels
 */
const dir = 'data';

export async function fetchHighestTier() {

    const supabaseUrl = 'https://teeahpmcehxydogahogt.supabase.co';
    const supabaseKey = 'sb_publishable_Mb4wN-RHZjPYLW71o2e9rA_zARj3bTi';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    const listId = await supabaseClient
    .from('list')
    .select('listid')
    .eq('place', 1)
    .single();

    const listIdNumeric = listId.data.listid;

    console.log(listId);

    console.log(listIdNumeric);

    const highestTier = await supabaseClient
    .from('levels')
    .select('tier')
    .eq('listid', listIdNumeric)
    .single();

    console.log(highestTier);

    const highestTierNumeric = highestTier.data.tier;

    console.log(highestTierNumeric);

    return highestTierNumeric;
}

export async function fetchList() {

    const supabaseUrl = 'https://teeahpmcehxydogahogt.supabase.co';
    const supabaseKey = 'sb_publishable_Mb4wN-RHZjPYLW71o2e9rA_zARj3bTi';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
/*
    const listResult = await supabaseClient
    .from('list')
    .select('listid')
    .order('rank', { ascending: true });

    const approvedLevelCount = await supabaseClient
    .from('levels')
    .select('*', { count: 'exact' })
    .eq('approved', true).count;

    for (let path = 1; path <= approvedLevelCount; path++) {
        const levelResult = await supabaseClient
            .from('levels')
            .select('*')
            .eq('approved', true)
            .eq('listid', path);
        listResult.map()
    }
    return await Promise.all(
            listResult.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [
                        {
                            ...level,
                            path,
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank} ${path}.`);
                    return [null, path];
                }
            }),
        );
*/

    const {data: listResultRaw, error: listError} = await supabaseClient
    .from('list')
    .select('listid')
    .order('place', { ascending: true });
    console.log(listResultRaw);
    if (listError) console.error(listError);
    const listResult = listResultRaw.map((row) => row.listid);
    
    try {
        return await Promise.all(
            listResult.map(async (listid, rank) => {
                const levelResult = await supabaseClient
                    .from('levels')
                    .select('*')
                    .eq('approved', true)
                    .eq('listid', listid)
                    .single();
                
                const levelRecords = await supabaseClient
                    .from('records')
                    .select('*')
                    .eq('listid', listid)
                    .order('percent', { ascending: false });
                
                console.log(levelRecords.data);

                console.log(levelResult.data);
                try {
                    const level = levelResult.data;
                    return [
                        {
                            ...level,
                            listid,
                            records: levelRecords.data
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank} ${listid}.`);
                    return [null, listid];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {

    const supabaseUrl = 'https://teeahpmcehxydogahogt.supabase.co';
    const supabaseKey = 'sb_publishable_Mb4wN-RHZjPYLW71o2e9rA_zARj3bTi';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    const list = await fetchList();

    const highestTier = await fetchHighestTier();

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.firstvictor.toLowerCase(),
        ) || level.firstvictor;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.qualify, level.tier, highestTier),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.holder.toLowerCase(),
            ) || record.holder;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.qualify, level.tier, highestTier),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.qualify, level.tier, highestTier),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}
