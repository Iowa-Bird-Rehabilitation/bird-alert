import {ArrowLeftIcon, BadgeInfo, CircleUser, Clock, HomeIcon, MapPinIcon, Notebook, PhoneIcon} from 'lucide-react'
import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import React, {useEffect, useState} from 'react'
import {Badge} from '@/components/ui/badge'
import Airtable from 'airtable'
import Link from "next/link";
import { alertToWindow, formatDate, formatTime, getCurrentDateAndTime, getRTLevelColor, getStatusColor, renderSecondVolunteerElements } from '@/lib/utils'
import AcceptForm from './AcceptForm'
import { getCurrentUser } from 'aws-amplify/auth'


export default function RescueDetails({id}: { id: string }) {
    //state variables
    const [birdRescue, setBirdRescue] = useState<BirdAlert | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAcceptForm, setShowAcceptForm] = useState(false)
    const [localRescuerName, setLocalRescuerName] = useState<string>("")
    const [volunteers, setVolunteers] = useState<Volunteer[]>([])
    const [userNoteValue, setUserNoteValue] = useState<string>()
    const [twoPersonRescue, setTwoPersonRescue] = useState<Boolean>(false)
    const [username, setUsername] = useState<String>("")

    //connecting to airtable
    const airtable = new Airtable({apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN})
    const airtableBase = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    const fetchBirdRescue = async () => {
        setError(null)
        // airtable fetch
        const record = await airtableBase('Bird Alerts').find(id)

        //conversion
        return {
            id: record.get('_id') as string,
            species: record.get('TypeOfBird') as string,
            location: record.get('FullPickUpAddress') as string,
            destination: record.get('DropOffAddress') as string,
            status: record.get('VolunteerStatus') as RescueStatus,
            birdStatus: record.get('BirdStatus') as BirdStatus,
            notes: record.get("Notes") as string,
            userNotes: record.get("UserNotes") as string,
            callerNumber: record.get("CallerContactNumber") as string,
            rtLevel: record.get('RTLevel') as RTLevel,
            skills: record.get('TechnicalSkills') as string[],
            possibleVolunteers: record.get("PossibleVolunteers") as string[] ?? [],
            nonQualifiedVolunteers: record.get("NonQualifiedVolunteers") as string[],
            currentVolunteer: record.get("CurrentVolunteer") as string,
            secondVolunteer: record.get("SecondVolunteer") as string,
            photo: record.get('BirdPhoto') ? ((record.get('BirdPhoto') as object[])[0] as {
                url: string,
                width: number,
                height: number
            }) : {} as { url: string, width: number, height: number },
            created: record.get('Created') as string
        } as BirdAlert
    }

    useEffect(() => {
        fetchBirdRescue().then((b) => {
            setBirdRescue(b)
            setUserNoteValue(b.userNotes)
            const regex = new RegExp( b.skills.join( "|" ), "i");
            setTwoPersonRescue(regex.test("two person job"))
        });
    }, []);

    //Change status of VolunteerStatus
    const handleVolunteerStatusChange = async (newStatus: RescueStatus) => {

        if (birdRescue) {
            setIsLoading(true)
            try {
                const updatedFields = {VolunteerStatus: newStatus}

                if (newStatus === 'Pending') {
                    setShowAcceptForm(true)
                    setIsLoading(false)
                    return
                }

                // update airtable column
                if (birdRescue.currentVolunteer !== "None") {
                    await updateRescueInAirtable(birdRescue.id, updatedFields)
                }

                // update the bird in BirdAlertList so that it has the new status
                const updatedBird = {
                    ...birdRescue
                }

                updatedBird.status = newStatus
                setBirdRescue(updatedBird)

            } catch (error) {
                console.error('Error updating bird rescue status:', error)
                setError('Failed to update rescue status. Please try again.')
            }
            setIsLoading(false)
        }

    }

    function handleAcceptClick() {
        setShowAcceptForm(true)
    }

    async function updateBirdAlert(fields: {SecondVolunteer: string, VolunteerStatus: string} | {CurrentVolunteer: string, VolunteerStatus: string}) {
        try {
            await airtableBase('Bird Alerts').update([
                {
                    id: birdRescue!.id,
                    fields: fields
                }
            ])
            setShowAcceptForm(false)
        } catch {
            throw error
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (twoPersonRescue && birdRescue?.currentVolunteer !== "None") {

            if ((await fetchBirdRescue()).secondVolunteer !== "None") {
                alertToWindow("Both spots have been claimed by other volunteers. Please refresh your page to see the updated data.")
                return
            }
           
            const fields = {
                            SecondVolunteer: localRescuerName, 
                            VolunteerStatus: `In Route`
                        }

            try {
                await updateBirdAlert(fields)

                const updatedBird = {...birdRescue} as BirdAlert
                updatedBird.secondVolunteer = localRescuerName
                updatedBird.status = 'In Route'
                setBirdRescue(updatedBird)
            } catch {
                throw error
            }

        }else {

            if ((await fetchBirdRescue()).currentVolunteer !== "None") {
                window.alert("Another user has already claimed this Bird Alert, please refresh your page to see the updated data.")
                return
            }

            const fields = {
                            CurrentVolunteer: localRescuerName, 
                            VolunteerStatus: `${birdRescue?.currentVolunteer === "None" && !twoPersonRescue ? 'In Route' : "Pending"}`
                        }

            try {
                await updateBirdAlert(fields)

                const updatedBird = {...birdRescue} as BirdAlert
                updatedBird.currentVolunteer = localRescuerName

                if (updatedBird.currentVolunteer !== "None" && !twoPersonRescue) {
                    updatedBird.status = 'In Route'
                }
                setBirdRescue(updatedBird)
            } catch {
                throw error
            }
        }
    }

    // get volunteers based off of the PossibleVolunteers column
    const fetchVolunteers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const records = airtableBase('Rescue and Transport Team').select({
                view: 'Volunteer Names & ID Only',
                fields: ["Name", "_id"]
            })

            const volunteersData : Volunteer[] = []
            await records.eachPage((records, processNextPage) => {
                records.forEach(({fields, id}) => {
                    volunteersData.push({
                        id: fields._id as string,
                        name: fields.Name as string
                    })
                })
                processNextPage()
            })
            setVolunteers(volunteersData)
        } catch (error) {
            setIsLoading(false)
            console.error('Error fetching bird rescues:', error)
            setError('Failed to fetch bird rescues. Please try again later.')
        }
        setIsLoading(false)
    }

    const updateRescueInAirtable = async (id: string, fields: any) => {
        try {
            const updatedRecords = await airtableBase('Bird Alerts').update([
                {
                    id,
                    fields: fields
                }
            ])
            return updatedRecords
        } catch (error) {
            console.error('Error updating Airtable:', error)
            throw error
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const { username, userId, signInDetails } = await getCurrentUser();
            setUsername(username);
        };

        fetchData()
        fetchVolunteers()
    }, [])

    console.log(birdRescue)


    return (!birdRescue ? (
            <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin"/>
            </div>
        ) :
        (
            <div className="p-4 pb-14">
                <div className="flex items-center">
                    <Link className="mr-2 mb-6 mt-3" href={"/"}>
                        <div><ArrowLeftIcon className="inline-block h-4 w-4 mb-1"/> Back</div>
                    </Link>
                </div>

                <Card className="border shadow-lg rounded-lg overflow-hidden">
                    <CardHeader className="bg-stone-100 border-b border-stone-200 px-4 py-2">
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                                <span className="font-medium text-xl text-stone-700">{birdRescue.species}</span>
                            </div>
                            <Badge variant="secondary" className={`${getStatusColor(birdRescue.status)} text-white`}>
                                {birdRescue.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 py-4 space-y-4">
                        {
                            birdRescue.photo['url']
                                ?
                                    <img
                                    src={birdRescue.photo['url']}
                                    width={birdRescue.photo['width']}
                                    height={birdRescue.photo['height']}
                                    alt={birdRescue.species}
                                    className="rounded-md shadow-md w-full md:w-2/4 float-left md:mr-8 md:mb-8"/>
                                :   
                                    <>
                                        <img src='../images/birds-outline.jpg' alt='outline of a generic bird'/> 
                                    </>
                        }
                        
                        <Badge variant="secondary" className={`${getRTLevelColor(birdRescue.rtLevel)} text-white mr-2`}>
                            {birdRescue.rtLevel}
                        </Badge>
                        {
                            twoPersonRescue ?
                                <Badge variant="secondary" className={`bg-violet-700 hover:bg-violet-800 text-white`}>
                                    Two Person Rescue
                                </Badge>
                            :
                                <></>
                        }
                        

                        <div className="">
                            <span className="font-bold text-black">Technical Skills:</span>
                            <ul className="">
                                {birdRescue.skills?.map((skill, index) =>{
                                    return (
                                        <Badge variant="secondary" key={index} className={`bg-gray-800 hover:bg-gray-900 text-white mr-2`}>
                                            <li key={index}>{skill}</li>
                                        </Badge>
                                    )
                                })}
                                
                            </ul>
                        </div>

                        <div className="space-y-4 pb-8">
                            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                                <div className="flex items-center overflow-hidden">
                                    <MapPinIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                    <a href={`https://maps.google.com/?q=${birdRescue.location}`} target='_blank'
                                       rel="noopener noreferrer"
                                       className="font-medium text-lime-600 dark:text-lime-500 hover:underline">
                                        <span
                                            className="float-left truncate hover:underline">{birdRescue.location}</span>
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                                <div className="flex items-center overflow-hidden">
                                    <HomeIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                    <a href={`https://maps.google.com/?q=${birdRescue.destination}`} target='_blank'
                                       rel="noopener noreferrer"
                                       className="font-medium text-lime-600 dark:text-lime-500 hover:underline">
                                        <span
                                            className="float-left truncate hover:underline">{birdRescue.destination}</span>
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center bg-stone-50 p-3 rounded-md">
                                <CircleUser className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                <span>Current Volunteer:  
                                    <span className='bold-text'>
                                        {birdRescue.currentVolunteer !== "None" ? " " + birdRescue.currentVolunteer : ` AVAILABLE${twoPersonRescue && birdRescue.currentVolunteer === "None" ? "(2)" : ""}`}
                                        {renderSecondVolunteerElements(birdRescue, twoPersonRescue)}
                                    </span> 
                                </span>
                            </div>

                            <div className="flex items-center bg-stone-50 p-3 rounded-md">
                                <Clock className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                <h2 className='mr-2'>Date & Time of Alert: <span className='bold-text'>{formatDate(birdRescue.created)} {formatTime(birdRescue.created)}</span></h2>
                            </div>

                            <div className="flex items-center bg-stone-50 p-3 rounded-md">
                                <Notebook className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                <h2 className='mr-2 '>Bird-Alert Notes: <span className='bold-text'>{birdRescue.notes}</span></h2>
                            </div>

                            <div className="flex items-center bg-stone-50 p-3 rounded-md flex-row">
                                <PhoneIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/> 
                                <h2 className='mr-2'>Bird alert caller phone number: {birdRescue.callerNumber ? birdRescue.callerNumber : "No number available"}</h2>                                
                            </div>

                            {
                                birdRescue.callerNumber

                                    ?
                                        <a href={`tel:${birdRescue?.callerNumber.replace(/\D/g,'')}`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-lime-600 hover:bg-lime-300 transition-colors duration-200 ease-in-out text-white"
                                            >
                                            <PhoneIcon className="mr-2"/> Call bird alert caller
                                        </a>

                                    :
                                        <></>
                            }
                            
                            

                            <div className="flex flex-col items-start bg-stone-50 p-3 rounded-md ">
                                <div className="flex text-align-left items-center bg-stone-50 pb-4 pt-1 rounded-md">
                                    <Notebook className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                    <p>Volunteer Notes: <span></span></p>
                                </div>
                                <textarea onChange={(e) => setUserNoteValue(e.target.value)} className='border-2 w-full h-40 p-2 rounded-md resize-none'>{birdRescue.userNotes}</textarea>
                                <button onClick={() => updateRescueInAirtable(birdRescue.id, {UserNotes: userNoteValue + ` - ${username} (${getCurrentDateAndTime()})`})} className="w-36 bg-blue-600 text-sm hover:bg-blue-700 text-white mt-3 h-8 transition-colors duration-200 rounded-md "> Save Note</button>
                            </div>
                             
                        </div>
                        <div className="space-y-4" style={{marginBottom: "30px"}}>
                            {
                                showAcceptForm &&
                                <AcceptForm
                                    volunteers={volunteers}
                                    birdRescue={birdRescue}
                                    setShowAcceptForm={setShowAcceptForm}
                                    handleSubmit={handleSubmit}
                                    setLocalRescuerName={setLocalRescuerName}
                                    localRescuerName={localRescuerName}
                                    twoPersonRescue={twoPersonRescue}
                                />
                            }
                            {birdRescue.status === 'Pending' && birdRescue.currentVolunteer === "None" && (
                                <Button
                                    className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200"
                                    onClick={handleAcceptClick}>
                                    Accept Rescue
                                </Button>
                            )}
                            {birdRescue.status === 'Pending' && birdRescue.currentVolunteer !== "None" && birdRescue.secondVolunteer === "None" && twoPersonRescue && (
                                <Button
                                    className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200"
                                    onClick={handleAcceptClick}>
                                    Accept Rescue (Second Volunteer)
                                </Button>
                            )}
                            {birdRescue.status === 'In Route' &&  (
                                <Button
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-200"
                                    onClick={() => handleVolunteerStatusChange('On Scene')}>
                                    Mark as On Scene
                                </Button>
                            )}
                            {birdRescue.status === 'On Scene' &&  (
                                <Button
                                    className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200"
                                    onClick={() => handleVolunteerStatusChange('Rescued')}>
                                    Mark as Rescued
                                </Button>
                            )}
                            {birdRescue.status === 'Rescued' && (
                                <Button
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors duration-200"
                                    onClick={() => handleVolunteerStatusChange('Delivered')}>
                                    Mark as Delivered
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-col content-center items-start bg-stone-50 p-3 rounded-md">
                            <div className='flex items-center mb-4'>
                                <BadgeInfo className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                <h2 className='mr-2'><span className='font-bold'>Additional Statuses: </span>If applicable please add in the notes below and contact IBR</h2>
                            </div>
                            
                            <p className='ml-7'><span className='font-bold'>Rescued - Released:</span> Bird released on site, no further help needed.</p>
                            <p className='ml-7'><span className='font-bold'>No Show:</span> Bird was not there or no longer in area.</p>
                            <p className='ml-7'><span className='font-bold'>Assessed:</span> Situation assessed, further help needed at a later time.</p>
                            <p className='ml-7'><span className='font-bold'>Died:</span> The Bird has died on scene.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        ));
}
