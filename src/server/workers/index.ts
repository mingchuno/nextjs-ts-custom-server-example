import { exampleCall } from '../services/exampleService'

export async function registerWorkers() {
  // TODO: start your cron job here!
  console.log('Start cron job here!')
  console.log(process.env.APP_EXAMPLE_ENV)
  exampleCall()
}
