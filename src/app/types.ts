type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered'
type RTLevel = 'Green: songbirds & babies' | 'Yellow: geese, ducks and swans' | 'Red: herons, bats' | 'Purple: raptors';
type Skills = 'Pickup and Transport' | 'Water Rescue' | '2 Person job' | 'Heights: Tree service needed/Ladder' | 'Triage Trained';

interface BirdAlert {
    id: string,
    species: string,
    location: string,
    destination: string,
    status: RescueStatus,
    rtLevel: RTLevel,
    skills: Skills[],
    possibleVolunteers: string[];
    currentVolunteer: string,
    photo: { url: string, width: number, height: number },
}
