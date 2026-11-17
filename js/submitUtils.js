const supabaseUrl = 'https://teeahpmcehxydogahogt.supabase.co';
const supabaseKey = 'sb_publishable_Mb4wN-RHZjPYLW71o2e9rA_zARj3bTi';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const selectLevels = document.getElementById('levels');

async function fetchLevels() {

    const levelIds = await supabaseClient

        .from('levels')
        .select('listid, name')
        .order('rank', { ascending: true });

    console.log(levelIds.data);

    selectLevels.innerHTML = '<option value="" disabled selected>Select an option...</option>';

    for (let i = 0; i < levelIds.data.length; i++) {
        const option = document.createElement('option');
        option.value = levelIds.data[i].listid;
        option.text = levelIds.data[i].name;
        selectLevels.appendChild(option);
    }
}

fetchLevels();