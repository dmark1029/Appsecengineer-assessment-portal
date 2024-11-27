import { format } from 'quasar'

export const date = [(val) => /^-?[\d]+[/-][0-1]\d[/-][0-3]\d$/.test(val) || 'Please provide a valid date']

export const email = [(val, rules) => rules.email(val) || 'Please provide a valid email']

export const number = [(val) => /^[0-9]+$/.test(val) || 'Only numbers are allowed']

export const required = [(val) => !!val || 'Required field']

export const shortName = [
  (val) => val.length >= 2 || 'The minimum is 2 characters',
  (val) => val.length <= 50 || 'The maximum is 50 characters',
  (val) => /^[a-zA-Z0-9 ]+$/.test(val) || 'Special characters are not allowed'
]

export const longName = [
  (val) => val.length >= 2 || 'The minimum is 2 characters',
  (val) => val.length <= 200 || 'The maximum is 200 characters',
  (val) => /^[a-zA-Z0-9 ]+$/.test(val) || 'Special characters are not allowed'
]

export function min(min) {
  return [(val) => val >= min || `The minimum is ${min}`]
}

export function max(max) {
  return [(val) => val <= max || `The maximum is ${max}`]
}

export function minLength(min) {
  return [(val) => val.length >= min || `The minimum is ${min} characters`]
}

export function maxLength(max) {
  return [(val) => val.length <= max || `The maximum is ${max} characters`]
}

export function fileSize(max = 5000000) {
  return [(val) => val || 'Required field', (val) => val.size < max || `The maximum file size is ${format.humanStorageSize(max)}`]
}
