import React, { FormEventHandler } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { XIcon } from 'lucide-react'
import { Label } from './ui/label'

interface Props {
    volunteers: Volunteer[],
    birdRescue: BirdAlert,
    setShowAcceptForm: Function,
    handleSubmit: FormEventHandler,
    setLocalRescuerName: Function,
    localRescuerName: string
}

export default function AcceptForm({volunteers, birdRescue, setShowAcceptForm, handleSubmit, setLocalRescuerName, localRescuerName}: Props) {

    function renderNameOptions() {
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
                            {renderNameOptions()}
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
