import base64url from 'base-64'

const months = { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' }

export const dateFormatReadable = (dateFormate) => {
  const splitedData = dateFormate.split('-')
  const year = parseInt(splitedData[0])
  const month = months[parseInt(splitedData[1])]
  const day = parseInt(splitedData[2])
  let result = ''
  if (day) {
    result = `${day} ${month} ${year}`
  } else {
    result = `${month} ${year}`
  }
  return result
}

export const urlSafeBase64Encode = (data) => {
  return base64url.encode(data)
}

export const urlSafeBase64Decode = (data) => {
  return base64url.decode(data)
}

export const fullDateTimeUTC = (dateTimeString) => {
  const date = new Date(dateTimeString)

  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return new Intl.DateTimeFormat('en-US', options).format(date) // Jan 1, 2020, 12:00 AM
}
export const convertJsonToFormData = (data) => {
  const formData = new FormData()
  const entries = Object.entries(data)
  for (let i = 0; i < entries.length; i++) {
    const arKey = entries[i][0]
    let arVal = entries[i][1]
    if (typeof arVal === 'boolean') {
      arVal = arVal === true ? 1 : 0
    }
    if (Array.isArray(arVal)) {
      if (this.isFile(arVal[0])) {
        for (let z = 0; z < arVal.length; z++) {
          formData.append(`${arKey}[]`, arVal[z])
        }

        continue
      } else if (arVal[0] instanceof Object) {
        for (let j = 0; j < arVal.length; j++) {
          if (arVal[j] instanceof Object) {
            for (const prop in arVal[j]) {
              if (Object.prototype.hasOwnProperty.call(arVal[j], prop)) {
                if (!isNaN(Date.parse(arVal[j][prop]))) {
                  formData.append(`${arKey}[${j}][${prop}]`, new Date(arVal[j][prop]))
                } else {
                  formData.append(`${arKey}[${j}][${prop}]`, arVal[j][prop])
                }
              }
            }
          }
        }
        continue
      } else {
        arVal = JSON.stringify(arVal)
      }
    }

    if (arVal === null) {
      continue
    }
    formData.append(arKey, arVal)
  }
  return formData
}


export const getformattedDuration=(timeLeftMS)=> {
  let seconds = Math.floor((timeLeftMS / 1000) % 60),
    minutes = Math.floor((timeLeftMS / (1000 * 60)) % 60),
    hours = Math.floor(timeLeftMS / (1000 * 60 * 60));
  if(hours<10){
    hours='0' + hours
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return `${hours}hrs : ${minutes}mins : ${seconds}secs`
}
