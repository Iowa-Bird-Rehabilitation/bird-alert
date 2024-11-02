type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered' | 'Incomplete' | 'Released On Site'
type RTLevel = 'Green: songbirds & babies' | 'Yellow: geese, ducks and swans' | 'Red: herons, bats' | 'Purple: raptors';
type Skills = 'Pickup and Transport' | 'Water Rescue' | '2 Person job' | 'Heights: Tree service needed/Ladder' | 'Triage Trained';
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
    rtLevel: RTLevel,
    skills: Skills[],
    possibleVolunteers: string[];
    currentVolunteer: string,
    secondVolunteer: string,
    twoPersonRescue: Boolean,
    photo: { url: string, width: number, height: number },
    created: string
}
