export const getStatusColor = (status: RescueStatus) => {
  switch (status) {
      case 'Pending':
          return 'bg-rose-600 hover:bg-rose-800'
      case 'In Route':
          return 'bg-amber-600 hover:bg-amber-800'
      case 'On Scene':
          return 'bg-pink-500 hover:bg-pink-600'
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

export const getRTLevelColor = (level: RTLevel) => {
    console.log(level)
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

export function renderSecondVolunteerElements(rescue : BirdAlert) {
  if (!rescue.twoPersonRescue) return

  if (rescue.secondVolunteer) {
      return `, ${rescue.secondVolunteer}`
  }else if (!rescue.secondVolunteer && rescue.currentVolunteer) {
      return `, SECOND VOLUNTEER NEEDED`
  }
}