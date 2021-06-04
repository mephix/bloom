// At Round Zero of Date Night, notify everyone who has a date:
// * max once per round
// In subsequent rounds, notify anyone who has a date with a high enough score (mutual match):
// * max once per round
// * max once per match
// * max 5 times per date night

// Data Structure:
// [id]: [{ time, dateId, matchId, score }]

// Each round, x seconds after start:
// for all (dates that are current, active, accepted=null) and `for` is not here:
// if ( score > x || roundNumber==0 ):
// etc