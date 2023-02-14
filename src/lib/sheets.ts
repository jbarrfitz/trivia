
import { Rowdies } from '@next/font/google';
import { google } from 'googleapis';

export async function getEmojiList() {
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

    const locations = data.valueRanges[1].values?.reduce((accumulator: Record<string, any>, row) => {
        const [shortCode, name, address, area, city, state, zip, locationLink] = row;
        accumulator[shortCode] = { shortCode, name, address, area, city, state, zip, locationLink };
        return accumulator;
    }, {})

    // ...hosts

    const events = data.valueRanges[0].values?.map((row) => {
        const [location, date, host, recurring, cancelled] = row;
        return { location, date, host, recurring, cancelled };
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
