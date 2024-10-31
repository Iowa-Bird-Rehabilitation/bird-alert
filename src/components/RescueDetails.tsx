import {ArrowLeftIcon, CircleUser, HomeIcon, MapPinIcon, Notebook, XIcon} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import React, {useEffect, useState} from 'react'
import {Badge} from '@/components/ui/badge'
import Airtable, { base } from 'airtable'
import Link from "next/link";

export default function RescueDetails({id}: { id: string }) {
    //state variables
    const [birdRescue, setBirdRescue] = useState<BirdAlert | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAcceptForm, setShowAcceptForm] = useState(false)
    const [localRescuerName, setLocalRescuerName] = useState<string>("")
    const [volunteers, setVolunteers] = useState<any[]>([])
    const [userNoteValue, setUserNoteValue] = useState<string>()

    //connecting to airtable
    const airtable = new Airtable({apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN})
    const airtableBase = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    const fetchBirdRescues = async () => {
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
            rtLevel: record.get('RTLevel') as RTLevel,
            skills: record.get('TechnicalSkills') as Skills[],
            possibleVolunteers: record.get("PossibleVolunteers") as string[] ?? [],
            currentVolunteer: record.get("CurrentVolunteer") as string,
            secondVolunteer: record.get("SecondVolunteer") as string,
            twoPersonRescue: record.get("TwoPersonRescue") as Boolean,
            photo: record.get('BirdPhoto') ? ((record.get('BirdPhoto') as object[])[0] as {
                url: string,
                width: number,
                height: number
            }) : {} as { url: string, width: number, height: number },
        } as BirdAlert
    }

    useEffect(() => {
        fetchBirdRescues().then((b) => {
            setBirdRescue(b)
            setUserNoteValue(b.userNotes)
        });
    }, []);


    // colors for the statuses that correspond to the airtable colors in the 'VolunteerStatus' column
    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
            case 'Pending':
                return 'bg-rose-600 hover:bg-rose-800'
            case 'In Route':
                return 'bg-amber-600 hover:bg-amber-800'
            case 'Rescued':
                return 'bg-violet-700 hover:bg-violet-800'
            case 'Delivered':
                return 'bg-teal-700 hover:bg-teal-800'
            case 'Incomplete':
                return 'bg-red-600 hover:bg-red-700'
            case 'Released On Site':
                return 'bg-pink-500 hover:bg-pink-600'
            default:
                return 'bg-gray-800 hover:bg-gray-900'
        }
    }

    const getRTLevelColor = (level: RTLevel) => {
        if (level.toLowerCase().includes("green")) {
            return 'bg-green-600 hover:bg-green-800'
        }else if (level.toLowerCase().includes("yellow")) {
            return 'bg-yellow-600 hover:bg-yellow-800'
        }else if (level.toLowerCase().includes("red")) {
            return 'bg-red-600 hover:bg-red-800'
        }else if (level.toLowerCase().includes("purple")) {
            return 'bg-purple-600 hover:bg-purple-800'
        }else {
            return 'bg-gray-500 hover:bg-gray-800'
        }
    }

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
                if (birdRescue.currentVolunteer) {
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

    ///// handle the change of the bird status
    const handleBirdStatusChange = async (newBirdStatus : BirdStatus) => {

        if (birdRescue) {
            try {

                let updatedFields
                let newVolunteerStatus : RescueStatus = birdRescue.status
                if (newBirdStatus === "Assessed" || newBirdStatus === "Died" || newBirdStatus === "No Show") {
                    newVolunteerStatus = "Incomplete"
                    updatedFields = {BirdStatus: newBirdStatus, VolunteerStatus: newVolunteerStatus}
                }else if (newBirdStatus === "Rescued - Released") {
                    newVolunteerStatus = "Released On Site"
                    updatedFields = {BirdStatus: newBirdStatus, VolunteerStatus: newVolunteerStatus}
                }else {
                    updatedFields = {BirdStatus: undefined, VolunteerStatus: birdRescue.status}
                }

                // update airtable column
                if (birdRescue.currentVolunteer) {
                    await updateRescueInAirtable(birdRescue.id, updatedFields)
                }
                
                // update the bird in BirdAlertList so that it has the new status
                const updatedBird = {
                    ...birdRescue
                }

                updatedBird.birdStatus = newBirdStatus
                updatedBird.status = newVolunteerStatus
                setBirdRescue(updatedBird)

            }catch (error) {
                console.error('Error updating bird status:', error)
                setError('Failed to update bird status. Please try again.')
            }
        }
    }

    function handleAcceptClick() {
        setShowAcceptForm(true)
    }

    function handleAcceptSecondVolunteerClick() {
        setShowAcceptForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //// This runs the secondary submit function if it is the second volunteer being chosen
        if (birdRescue?.twoPersonRescue && birdRescue.currentVolunteer) {
            handleSubmitSecondVolunteer(e)
        }else {
            const fields = {CurrentVolunteer: localRescuerName, VolunteerStatus: `${!birdRescue?.currentVolunteer && !birdRescue?.twoPersonRescue ? 'In Route' : "Pending"}`}
            try {
                const updatedRecords = await airtableBase('Bird Alerts').update([
                    {
                        id: birdRescue!.id,
                        fields: fields
                    }
                ])
                setShowAcceptForm(false)
                const updatedBird = {...birdRescue} as BirdAlert
                updatedBird.currentVolunteer = localRescuerName
                if (updatedBird.currentVolunteer && !updatedBird.twoPersonRescue) {
                    updatedBird.status = 'In Route'
                }
                setBirdRescue(updatedBird)
            } catch {
                throw error
            }
        }
    }

    const handleSubmitSecondVolunteer = async (e: React.FormEvent) => {
        e.preventDefault()
        const fields = {SecondVolunteer: localRescuerName, VolunteerStatus: `In Route`}
        try {
            const updatedRecords = await airtableBase('Bird Alerts').update([
                {
                    id: birdRescue!.id,
                    fields: fields
                }
            ])
            setShowAcceptForm(false)
            const updatedBird = {...birdRescue} as BirdAlert
            updatedBird.secondVolunteer = localRescuerName
            updatedBird.status = 'In Route'
            setBirdRescue(updatedBird)
        } catch {
            throw error
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

            /// Airtable has a weird type of fieldSet that causes issues with all of the typing and I cant seem to figure it out, so I just made this one type of any
            const volunteersData : any[] = []
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
            console.error('Error fetching bird rescues:', error)
            setError('Failed to fetch bird rescues. Please try again later.')
        }
        setIsLoading(false)
    }


    function acceptForm() {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                 onClick={() => setShowAcceptForm(false)}>
                <Card className="w-full max-w-md " onClick={(e) => e.stopPropagation()}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Accept
                                Rescue</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
                                <XIcon className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="block mb-2 text-sm font-medium text-gray-900"> Your Name</Label>
                                <select required onChange={(e) => setLocalRescuerName(e.target.value) } name='name'
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value={""}>-- Please Pick Your Name</option>
                                    {populateNameOptions()}
                                </select>
                            </div>
                            <Button disabled={!localRescuerName} type="submit"
                                    className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                                Accept Rescue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // this is what actually populates the list
    function populateNameOptions() {
        
        const volunteerOptions = volunteers.filter((vol: {id: string, name: string}) => birdRescue!.possibleVolunteers.includes(vol.id) && vol.name !== birdRescue?.currentVolunteer)
        const volunteerOptionElements = volunteerOptions.map((vol: { id: string, name: string }, index: number) => {
            return (
                <option key={index} value={vol.name}>
                    {vol.name}
                </option>
            )
        })

        return volunteerOptionElements
    }

    const updateRescueInAirtable = async (id: string, fields: any) => {
        try {
            const updatedRecords = await airtableBase('Bird Alerts').update([
                {
                    id,
                    fields: fields
                }
            ])
            console.log('Airtable update response:', updatedRecords)
            return updatedRecords
        } catch (error) {
            console.error('Error updating Airtable:', error)
            throw error
        }
    }

    function renderSecondVolunteerElements(rescue : BirdAlert) {
        if (!rescue.twoPersonRescue) return

        if (rescue.secondVolunteer) {
            return `, ${rescue.secondVolunteer}`
        }else if (!rescue.secondVolunteer && rescue.currentVolunteer) {
            return `, SECOND VOLUNTEER NEEDED`
        }
    }

    useEffect(() => {
        fetchVolunteers()
    }, [])

    return (!birdRescue ? (
            <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin"/>
            </div>
        ) :
        (
            <div className="p-4">
                <div className="flex items-center">
                    <Link className="mr-2 mb-3" href={"/"}>
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
                        <img
                            src={birdRescue.photo['url']}
                            width={birdRescue.photo['width']}
                            height={birdRescue.photo['height']}
                            alt={birdRescue.species}
                            className="rounded-md shadow-md w-full md:w-2/4 float-left md:mr-8 md:mb-8"/>
                        <Badge variant="secondary" className={`${getRTLevelColor(birdRescue.rtLevel)} text-white`}>
                            {birdRescue.rtLevel}
                        </Badge>

                        <div className="">
                            <span className="font-bold text-black">Technical Skills:</span>
                            <ul className="">
                                {birdRescue.skills?.map((skill, index) => <li key={index}>{skill}</li>)}
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
                                        {birdRescue.currentVolunteer ? " " + birdRescue.currentVolunteer : ` AVAILABLE${birdRescue.twoPersonRescue && !birdRescue.currentVolunteer ? "(2)" : ""}`}
                                        {renderSecondVolunteerElements(birdRescue)}
                                    </span> 
                                </span>
                            </div>

                            
                            {
                                birdRescue.status === "Pending" ?
                                    <></>
                                :
                                    <div className="flex items-center bg-stone-50 p-3 rounded-md">
                                        <select onChange={(e) => handleBirdStatusChange(e.target.value as BirdStatus)} name='bird-status'
                                            className=" w-4/12 cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            <option value={""}>-- Additional Bird Statuses</option>
                                            <option value={"Rescued - Released"}> Rescued - Released </option>
                                            <option value={"No Show"}> No Show </option>
                                            <option value={"Died"}> Died </option>
                                            <option value={"Assessed"}> Assessed </option>
                                        </select>
                                    </div>
                            }

                            <div className="flex items-center bg-stone-50 p-3 rounded-md">
                                <Notebook className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                <h2 className='mr-2'>Bird-Alert Notes: {birdRescue.notes}</h2>
                            </div>

                            <div className="flex flex-col items-start bg-stone-50 p-3 rounded-md ">
                                <div className="flex text-align-left items-center bg-stone-50 pb-4 pt-1 rounded-md">
                                    <Notebook className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                                    <p>Volunteer Notes:</p>
                                </div>
                                <textarea onChange={(e) => setUserNoteValue(e.target.value)} className='border-2 w-full h-40 p-2 rounded-md resize-none'>{birdRescue.userNotes}</textarea>
                                <button onClick={() => updateRescueInAirtable(birdRescue.id, {UserNotes: userNoteValue})} className="w-36 bg-blue-600 text-sm hover:bg-blue-700 text-white mt-3 h-8 transition-colors duration-200 rounded-md "> Save Note</button>
                            </div>
                            
                                
                        </div>
                        <div className="space-y-4">
                            {
                                showAcceptForm &&
                                acceptForm()
                            }
                            {birdRescue.status === 'Pending' && !birdRescue.currentVolunteer && (
                                <Button
                                    className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200"
                                    onClick={handleAcceptClick}>
                                    Accept Rescue
                                </Button>
                            )}
                            {birdRescue.status === 'Pending' && birdRescue.currentVolunteer && !birdRescue.secondVolunteer && birdRescue.twoPersonRescue && (
                                <Button
                                    className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200"
                                    onClick={handleAcceptSecondVolunteerClick}>
                                    Accept Rescue (Second Volunteer)
                                </Button>
                            )}
                            {birdRescue.status === 'In Route' &&  (
                                <Button
                                    className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200"
                                    onClick={() => handleVolunteerStatusChange('Rescued')}>
                                    Mark as rescued
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
                    </CardContent>
                </Card>
            </div>
        ));
}
