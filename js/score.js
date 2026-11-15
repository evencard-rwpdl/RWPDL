/**
 * Numbers of decimal digits to round to
 */
const scale = 3;



/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @param {Number} tier GDDL Tier of the level
 * @returns {Number}
 */


export function score(rank, percent, minPercent, tier, highestTier) {

    console.log(rank, percent, minPercent, tier, highestTier);

    if (rank > 150) {
        return 0;
    }
    if (rank > 75 && percent < 100) {
        return 0;
    }

    let score = 0

    if (rank < 1) {

        score = ((150 * tier)/(highestTier * 2)) * ((percent - minPercent) / (100 - minPercent));
        score = Math.max(0, score);
        console.log(score);

    }

    else {
        score = ((300 * tier)/(highestTier)) * ((percent - minPercent) / (100 - minPercent));
        score = Math.max(0, score);
        console.log(tier)
        console.log(score);
    }

    console.log(Math.round(score));
    console.log(Math.round(score * 1000) / 1000);

    if (percent != 100) {
        
        return round(score - score / 3);
    }
    else {
        return round(score);
    }

    // Old formula
    /*
    let score = (100 / Math.sqrt((rank - 1) / 50 + 0.444444) - 50) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    // New formula
    /*
    let score = (-24.9975*Math.pow(rank-1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
    */
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
