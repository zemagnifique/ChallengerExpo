// Assuming a context where 'user' and 'challenge' are defined.  This is a minimal example.
const isCoach = challenge ? parseInt(user?.id) === parseInt(challenge.coach_id) : false;

// ... rest of the code (which was not provided) would go here ...