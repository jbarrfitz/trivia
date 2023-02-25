
import { Rowdies } from '@next/font/google';
import { google } from 'googleapis';

interface Location {
  shortCode: string;
  name: string;
  address: string;
  area: string;
  city: string;
  /** 2 char state */
  state: string;

  zip: string;
  /** Google maps URL */
  locationLink: string;
}

interface Event {
  location: any;
  date: Date;
  host: string
  recurring: boolean;
  cancelled: boolean;
}

interface Schedule extends Event {
  location: string | Location;
}

/** TODO */
const cellToBoolean = (cell: string) => Boolean(cell)

export async function fetchSchedules() {
  try {
    const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      undefined,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      target
    );

    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const { data } = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: process.env.SPREADSHEET_ID,
        ranges: ['Events', 'Locations']
    });
    if (!data.valueRanges) {
        throw new Error('Data not returned')
    }

    const locations = data.valueRanges[1].values?.reduce((accumulator: Record<string, Location>, row) => {
        const [shortCode, name, address, area, city, state, zip, locationLink] = row;
        const location = { shortCode, name, address, area, city, state, zip, locationLink };
        accumulator[shortCode] = location;
        return accumulator;
    }, {})

    // ...hosts

    const events = data.valueRanges[0].values?.map((row) => {
        const [location, date, host, recurring, cancelled] = row;
        // const [location, date, host, recurring, cancelled] = row;
        // return { location, date, host, recurring, cancelled };
        const event = { location, date: new Date(date), host, recurring: cellToBoolean(recurring), cancelled: cellToBoolean(cancelled) };
        return event;
    })

    const joinedData = events?.map((event) => {
        event.location = locations?.[event.location] || {}
        return event;
    });

    // console.warn(locations)
    // console.warn(events)
    console.warn(joinedData)

    // WIP

    return []

  } catch (err) {
    console.log(err);
    return [];
  }
}
