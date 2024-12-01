type RescueStatus = 'Pending' | 'In Route' |'On Scene' | 'Rescued' | 'Delivered' | 'Incomplete' | 'Released On Site'
type RTLevel = 'Green: songbirds & babies' | 'Yellow: geese, ducks and swans' | 'Red: herons, bats' | 'Purple: raptors';
type BirdStatus = "" | 'Rescued - Released' | 'No Show' | 'Died' | 'Assessed' 

interface BirdAlert {
    id: string,
    species: string,
    location: string,
    destination: string,
    status: RescueStatus,
    birdStatus: BirdStatus,
    notes: string,
    userNotes: string,
    callerNumber: string,
    rtLevel: RTLevel,
    skills: string[],
    possibleVolunteers: string[];
    currentVolunteer: string,
    secondVolunteer: string,
    photo: { url: string, width: number, height: number },
    created: string
}

interface Volunteer {
    id: string,
    name: string
}
