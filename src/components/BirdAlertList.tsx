'use client'

import {ArrowRightIcon, ChevronsUpDown, Clock, HomeIcon, MapPinIcon, UserCircle} from 'lucide-react'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {useEffect, useState} from 'react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import Airtable from 'airtable'
import {Checkbox} from "@/components/ui/checkbox";
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {cn, formatDate, formatTime} from "@/lib/utils";
import Link from "next/link";

export default function BirdAlertList() {
    // creates the variables needed to set up the bird alert list
    const [birdRescues, setBirdRescues] = useState<BirdAlert[]>([])
    const allStatuses = ['Pending', 'In Route', 'Rescued', 'Delivered', 'Incomplete', 'Released On Site'] as RescueStatus[];
    const [value, setValue] = useState(new Set<RescueStatus>(['Pending', 'In Route', 'Rescued']))
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isFilterOpen, setIsFilterIsFilterOpen] = useState(false)
    const [showBestPractices, setShowBestPractices] = useState(false)

    // connection to airtable and the Bird Alert table.
    const airtable = new Airtable({apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN})
    const airtableBase = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    // colors for status
    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
            case 'Pending':
                return 'bg-rose-600 hover:bg-rose-800'
            case 'In Route':
                return 'bg-amber-600 hover:bg-amber-800'
            case 'Rescued':
                return 'bg-violet-700 hover:bg-violet-800'
            case 'Delivered':
                return 'bg-teal-700'
        }
    }

    // this function collects the records from airtable and converts them to type 'Bird'
    const fetchBirdRescues = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // airtable fetch
            const records = airtableBase('Bird Alerts').select({
                fields: [
                    "_id",
                    "TypeOfBird",
                    "FullPickUpAddress",
                    "DropOffAddress",
                    "VolunteerStatus",
                    "BirdStatus",
                    "Notes",
                    "UserNotes",
                    "RTLevel",
                    "TechnicalSkills",
                    "PossibleVolunteers",
                    "CurrentVolunteer",
                    "SecondVolunteer",
                    "TwoPersonRescue",
                    "BirdPhoto",
                    "Created"
                ]
            })

            const rescues : BirdAlert[] = []

            await records.eachPage((records, processNextPage) => {
                records.forEach(({fields}) => {
                    rescues.push({
                        id: fields._id as string,
                        species: fields.TypeOfBird as string,
                        location: fields.FullPickUpAddress as string,
                        destination: fields.DropOffAddress as string,
                        status: fields.VolunteerStatus as RescueStatus,
                        birdStatus: fields.BirdStatus as BirdStatus,
                        notes: fields.Notes as string,
                        userNotes: fields.UserNotes as string,
                        rtLevel: fields.RTLevel as RTLevel,
                        skills: fields.TechnicalSkills as Skills[],
                        possibleVolunteers: fields.PossibleVolunteers as string[] ?? [],
                        currentVolunteer: fields.CurrentVolunteer as string,
                        secondVolunteer: fields.SecondVolunteer as string,
                        twoPersonRescue: fields.TwoPersonRescue as Boolean,
                        photo: fields.BirdPhoto ? ((fields.BirdPhoto as object[])[0] as {
                            url: string,
                            width: number,
                            height: number
                        }) : {} as { url: string, width: number, height: number },
                        created: fields.Created as string
                    })
                })
                processNextPage()
            })

            //sets state variable
            setBirdRescues(rescues)
        } catch (error) {
            console.error('Error fetching bird rescues:', error)
            setError('Failed to fetch bird rescues. Please try again later.')
        }
        setIsLoading(false)
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
        fetchBirdRescues()
    }, [])

    return (
        <>
            <Card className="overflow-hidden border-none shadow-none bg-stone-100">
                <CardHeader className="">
                    <CardTitle className="text-lg font-semibold text-stone-800 pt-4">
                        Available Rescues
                        <Popover open={isFilterOpen} onOpenChange={setIsFilterIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isFilterOpen}
                                    className=" mt-2 w-full justify-between"
                                >
                                    {value
                                        ? Array.from(value).join(',')
                                        : "Select framework..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-8 shrink-0 opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="sm:w-[500px] p-0">
                                <Command>
                                    <CommandInput placeholder="Select statuses..."/>
                                    <CommandList>
                                        <CommandEmpty>No statuses found.</CommandEmpty>
                                        <CommandGroup>
                                            {allStatuses.map((status) => {
                                                if (status === "Delivered" || status === "Released On Site" || status === "Incomplete") {
                                                    return
                                                }
                                                return (
                                                    <CommandItem
                                                    key={status}
                                                    onSelect={() => {
                                                        const newValue = new Set(value)
                                                        if (newValue.has(status)) {
                                                            newValue.delete(status)
                                                        } else {
                                                            newValue.add(status)
                                                        }
                                                        setValue(newValue)
                                                        }}
                                                    >
                                                        <Checkbox
                                                            checked={value.has(status)}
                                                            className={cn(
                                                                "mr-2 h-4 w-4"
                                                            )}/>
                                                        {status}
                                                    </CommandItem>
                                                )
                                            })}
                                        </CommandGroup>
                                        <CommandItem>
                                            <Button onClick={() => setIsFilterIsFilterOpen(false)}>Done</Button>
                                        </CommandItem>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </CardTitle>
                </CardHeader>

                <Card className='overflow-hidden border-none shadow-none bg-stone-100'>
                    <CardHeader>
                        <Button variant="outline" onClick={() => setShowBestPractices(prevState => !prevState)}>{showBestPractices ? "Hide Bird Alert Best Practices & FAQ's" : "Show Bird Alert Best Practices & FAQ's"} </Button>
                    </CardHeader>
                </Card>
                {
                    showBestPractices &&
                    
                    <Card className="mr-4 ml-4 p-4">
                    <div>
                        <h2 className='text-center mb-4 font-bold'>Bird Alert Best Practices:</h2>
                    </div>
                    <div className='mb-3'>
                        <h2 className='font-bold'>Only change your own Bird Alert:</h2>
                        <p className='text-stone-800 text-sm'>
                            Once you pick up an alert, 
                            you should be the only person making changes on that alert (Unless it is an alert that requires two people, in this case you should coordinate with the other
                            volunteer to ensure that the correct changes are made).
                        </p>
                    </div>

                    <div className='mb-3'>
                        <h2 className='font-bold'>Keep your Bird Alert up to date:</h2>
                        <p className='text-stone-800 text-sm'>
                            If you are actively working on a Bird Alert, it is important to update the alert accordingly. For example if you have rescued the bird and 
                            are now transporting it to IBR, make sure to click the "Mark As Rescued" button in the alert. Keeping the alert updated helps IBR keep track of 
                            the current status of all active alerts.
                        </p>
                    </div>

                    <div className='mb-3'>
                        <h2 className='font-bold'>Read your Bird Alert closely:</h2>
                        <p className='text-stone-800 text-sm'>
                           All of the applicable information about the rescue/transport will be in the details of the Bird Alert. Make sure to read carefully so you do not miss any 
                           important details, including the notes given by IBR about the alert.
                        </p>
                    </div>

                    <div className='mb-5'>
                        <h2 className='font-bold'>Using the volunteer notes section:</h2>
                        <p className='text-stone-800 text-sm mb-2'>
                           The volunteer notes section gives you a way to communicate with other volunteers. However this should not be used as a messaging board.
                           These notes allow volunteers to provide important updates about the alert, that may be valuable to IBR or other volunteers. 
                        </p>

                        <p className='text-stone-800 text-sm mb-2'>
                            For example,
                           if you are qualified to pick up an alert, but cannot do so for a period of time, you can add to the notes section stating as such. If another volunteer can immediately 
                           pick up the Bird Alert, they can add another note stating that they have done so and then pick up the alert.
                        </p>

                        <p className='text-stone-800 text-sm'>
                            This allows other volunteers that may be involved to be updated on the current status of the alert.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-center mb-4 font-bold'>FAQ's:</h2>
                    </div>

                    <div className='mb-3'>
                        <h2 className='font-bold'>What do each of the status badges mean?</h2>
                        <p className='text-stone-800 text-sm mb-2'>
                           <span className='font-semibold'>Pending</span> - The bird alert has not been picked up yet, and is waiting for a qualified volunteer to do so.
                        </p>
                        <p className='text-stone-800 text-sm mb-2'>
                            <span className='font-semibold'>In Route</span> - The bird alert has been picked up by a volunteer and they are now on their way to the scene.
                        </p>
                        <p className='text-stone-800 text-sm mb-2'>
                            <span className='font-semibold'>Rescued</span> - The bird has been rescued, either released on site, or is now in transit to the IBR facility. 
                        </p>
                        <p className='text-stone-800 text-sm mb-2'>
                            <span className='font-semibold'>Delivered</span> - The bird has been dropped off at the IBR facility.
                        </p>
                    </div>

                    <div className='mb-3'>
                        <h2 className='font-bold'>Why is my name not available to choose?</h2>
                        <p className='text-stone-800 text-sm'>
                           The list of names available to choose for each bird alert is automatically determined when the bird alert is created by IBR.
                           This is based off of current skills, training, and location. If you believe that the system has incorrectly left your 
                           name off of an alert, please speak to IBR.
                        </p>
                    </div>
                    
                    <div className='mb-3'>
                        <h2 className='font-bold'>What should I do if there is an emergency?:</h2>
                        <p className='text-stone-800 text-sm'>
                           At the bottom of the page there is a call button that will call IBR directly. This should only be used in an emergency where
                           reaching IBR immediately is critical.
                        </p>
                    </div>
                    
                </Card>
                }
                
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin"/>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-32 text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:auto-cols-max md:grid-cols-2 lg:grid-cols-3">
                            {birdRescues.filter(bird => value.has(bird.status)
                            ).sort((a, b) => {
                                // Show pending rescues first
                                return allStatuses.indexOf(a.status) < allStatuses.indexOf(b.status) ? -1 : 1
                            }).map(rescue => {
                                if (rescue.status === "Delivered" || rescue.status === "Incomplete" || rescue.status === "Released On Site") {return}
                                return (
                                    <Card key={rescue.id} className="overflow-hidden">
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <CardTitle className="text-xl font-semibold">{rescue.species}</CardTitle>
                                                </div>
                                                <Badge variant="secondary"
                                                    className={`${getStatusColor(rescue.status)} text-white h-10 pl-8 pr-8 pt-2 pb-2 text-sm`}>
                                                    {rescue.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                
                                                <div className="flex items-center text-sm text-stone-600">
                                                    <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0"/>
                                                    <span className="truncate">{rescue.location}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-stone-600">
                                                    <HomeIcon className="mr-2 h-4 w-4 flex-shrink-0"/>
                                                    <span className="truncate">{rescue.destination}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-stone-600">
                                                    <UserCircle className="mr-2 h-4 w-4 flex-shrink-0"/>
                                                    <span>Current Volunteer: 
                                                        <span className='bold-text'>
                                                            {rescue.currentVolunteer ? " " + rescue.currentVolunteer : ` AVAILABLE${rescue.twoPersonRescue && !rescue.currentVolunteer ? "(2)" : ""}`} 
                                                            {renderSecondVolunteerElements(rescue)}                                                            
                                                        </span> 
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-stone-600">
                                                    <Clock className="mr-2 h-4 w-4 flex-shrink-0"/>
                                                    <span className="truncate">Date & Time of Alert: <span className='bold-text'>{formatDate(rescue.created)}  {formatTime(rescue.created)}</span></span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-stone-50 p-4">
                                            <Link href={`/bird-alert/${rescue.id}`}
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out text-black"
                                            >
                                                View Details
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                )
                                
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
