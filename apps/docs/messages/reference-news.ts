// Strings and item data of the reference site's news and event pages (P12–P14, R8). The sv object
// is typed by the en shape, so a missing key is a type error. Kvirnby is fictional.

const en = {
  news: {
    title: 'News',
    lead: 'What is happening in Kvirnby municipality, newest first.',
    count: ({ from, to, total }: { from: string; to: string; total: string }) =>
      `Showing ${from}–${to} of ${total} news items, newest first.`,
    pagination: 'News pages',
    published: 'Published',
    updated: 'Updated',
    related: 'Related news',
    items: [
      {
        slug: 'roadworks-storgatan',
        title: 'Roadworks on Storgatan until the end of November',
        publishedOn: '2026-10-09',
        updatedOn: '2026-10-12',
        summary:
          'Storgatan is being rebuilt between the square and Skolvägen. Buses are diverted and walking and cycling routes stay open.',
        body: [
          'Only one lane is open at a time, with traffic lights. Buses 3 and 7 use Skolvägen and stop at the temporary stops next to the town hall.',
          'The work is planned to finish on 30 November. If the weather delays it, we will tell you here.',
        ],
      },
      {
        slug: 'winter-parking',
        title: 'Winter parking rules start on 1 November',
        publishedOn: '2026-10-05',
        updatedOn: undefined,
        summary:
          'From 1 November, streets are cleared of snow on a fixed schedule. Check the signs before you park.',
        body: [
          'On streets with winter signs, parking is not allowed between 2.00 and 6.00 so the ploughs can reach the kerb.',
          'Holders of a disabled parking permit can still park in the marked spaces next to the town hall.',
        ],
      },
      {
        slug: 'recycling-centre-hours',
        title: 'The recycling centre opens an hour earlier on Saturdays',
        publishedOn: '2026-09-28',
        updatedOn: undefined,
        summary:
          'From October the recycling centre opens at 9.00 on Saturdays, to shorten the queues.',
        body: [
          'Weekday hours are unchanged. Large items such as furniture are still taken on Saturdays only.',
        ],
      },
      {
        slug: 'library-new-hours',
        title: 'The library extends its evening hours',
        publishedOn: '2026-09-17',
        updatedOn: undefined,
        summary: 'The main library is now open until 20.00 on Wednesdays and Thursdays.',
        body: ['The extra hours are staffed, so you can borrow, return and ask for help as usual.'],
      },
      {
        slug: 'new-preschool-places',
        title: 'Twenty new preschool places in the autumn',
        publishedOn: '2026-09-02',
        updatedOn: undefined,
        summary:
          'Hillside preschool opens a third group, so more families can get a place close to home.',
        body: [
          'Apply through the preschool service as usual. Families already in the queue are contacted in the order they applied.',
        ],
      },
    ],
    perPage: 3,
  },
  events: {
    title: 'Events',
    lead: 'Lectures, markets and open houses in Kvirnby.',
    upcoming: 'Upcoming events',
    past: 'Past events',
    cancelledWord: 'Cancelled: ',
    cancelledTitle: 'This event is cancelled',
    cancelledBody: 'The event will not take place. See the other events for what is coming up.',
    endedBody: 'This event has ended. See the other events for what is coming up.',
    when: 'When',
    where: 'Where',
    cost: 'Cost',
    accessibility: 'Accessibility',
    organiser: 'Organiser',
    to: 'to',
    book: 'Book a place',
    all: 'All events',
    items: [
      {
        slug: 'open-house-hillside',
        title: 'Open house at Hillside preschool',
        status: 'upcoming' as 'upcoming' | 'cancelled' | 'ended',
        startsAt: '2026-10-21T16:00:00Z',
        endsAt: '2026-10-21T18:00:00Z',
        place: ['Hillside preschool', 'Old Mill Road 12', '123 45 Kvirnby'],
        cost: 'Free',
        access: 'Level entrance with an automatic door. Hearing loop in the hall.',
        organiser: 'Hillside preschool',
        summary: 'See the groups, the garden and the kitchen, and meet the staff.',
        description:
          'Come and see the groups, the garden and the kitchen, and meet the staff. You can ask about places for the spring term.',
      },
      {
        slug: 'autumn-lecture',
        title: 'Autumn lecture: the history of Kvirnby',
        status: 'upcoming' as 'upcoming' | 'cancelled' | 'ended',
        startsAt: '2026-11-04T17:00:00Z',
        endsAt: '2026-11-04T18:30:00Z',
        place: ['Main library', 'Main Street 4', '123 45 Kvirnby'],
        cost: 'Free',
        access:
          'Level entrance. Hearing loop in the lecture room. The talk is also streamed with captions.',
        organiser: 'Kvirnby library',
        summary: 'A local historian tells how the town grew around the mill.',
        description:
          'A local historian tells how the town grew around the mill. There is time for questions afterwards.',
      },
      {
        slug: 'family-day',
        title: 'Family day at the swimming hall',
        status: 'cancelled' as 'upcoming' | 'cancelled' | 'ended',
        startsAt: '2026-11-15T09:00:00Z',
        endsAt: '2026-11-15T13:00:00Z',
        place: ['Kvirnby swimming hall', 'Pool Road 2', '123 45 Kvirnby'],
        cost: 'Free',
        access: 'Level entrance. Lift to the changing rooms and a pool hoist.',
        organiser: 'Culture and leisure',
        summary: 'Games and free swimming for the whole family.',
        description: 'Games and free swimming for the whole family.',
      },
      {
        slug: 'harvest-market',
        title: 'Harvest market on the square',
        status: 'ended' as 'upcoming' | 'cancelled' | 'ended',
        startsAt: '2026-09-23T16:00:00Z',
        endsAt: '2026-09-23T18:00:00Z',
        place: ['The square', 'Main Street', '123 45 Kvirnby'],
        cost: 'Free',
        access: 'Level ground. Accessible toilets in the town hall.',
        organiser: 'Business and work',
        summary: 'Local growers and bakers sell what the season gave.',
        description: 'Local growers and bakers sold what the season gave.',
      },
    ],
  },
}

const sv: typeof en = {
  news: {
    title: 'Nyheter',
    lead: 'Det händer i Kvirnby kommun, senaste först.',
    count: ({ from, to, total }: { from: string; to: string; total: string }) =>
      `Visar ${from}–${to} av ${total} nyheter, senaste först.`,
    pagination: 'Nyhetssidor',
    published: 'Publicerad',
    updated: 'Uppdaterad',
    related: 'Fler nyheter',
    items: [
      {
        slug: 'roadworks-storgatan',
        title: 'Vägarbete på Storgatan till slutet av november',
        publishedOn: '2026-10-09',
        updatedOn: '2026-10-12',
        summary:
          'Storgatan byggs om mellan torget och Skolvägen. Bussarna leds om och gång- och cykelvägarna hålls öppna.',
        body: [
          'Bara ett körfält är öppet åt gången, med trafikljus. Buss 3 och 7 går via Skolvägen och stannar vid de tillfälliga hållplatserna intill stadshuset.',
          'Arbetet beräknas vara klart den 30 november. Om vädret försenar det skriver vi det här.',
        ],
      },
      {
        slug: 'winter-parking',
        title: 'Vinterns parkeringsregler börjar gälla den 1 november',
        publishedOn: '2026-10-05',
        updatedOn: undefined,
        summary:
          'Från den 1 november snöröjs gatorna enligt ett fast schema. Läs skyltarna innan du parkerar.',
        body: [
          'På gator med vinterskyltar är det förbjudet att parkera mellan 2.00 och 6.00 så att plogbilarna kommer fram till trottoarkanten.',
          'Du med parkeringstillstånd för rörelsehindrade kan fortfarande parkera på de markerade platserna intill stadshuset.',
        ],
      },
      {
        slug: 'recycling-centre-hours',
        title: 'Återvinningscentralen öppnar en timme tidigare på lördagar',
        publishedOn: '2026-09-28',
        updatedOn: undefined,
        summary:
          'Från oktober öppnar återvinningscentralen klockan 9.00 på lördagar för att korta köerna.',
        body: [
          'Tiderna på vardagar är oförändrade. Skrymmande avfall som möbler tas fortfarande bara emot på lördagar.',
        ],
      },
      {
        slug: 'library-new-hours',
        title: 'Biblioteket utökar kvällsöppettiderna',
        publishedOn: '2026-09-17',
        updatedOn: undefined,
        summary: 'Huvudbiblioteket är nu öppet till 20.00 på onsdagar och torsdagar.',
        body: [
          'De utökade tiderna är bemannade, så du kan låna, lämna tillbaka och få hjälp som vanligt.',
        ],
      },
      {
        slug: 'new-preschool-places',
        title: 'Tjugo nya förskoleplatser till hösten',
        publishedOn: '2026-09-02',
        updatedOn: undefined,
        summary:
          'Förskolan Hillside öppnar en tredje grupp, så fler familjer får en plats nära hemmet.',
        body: [
          'Ansök via förskolans tjänst som vanligt. Familjer som redan står i kö kontaktas i den ordning de ansökte.',
        ],
      },
    ],
    perPage: 3,
  },
  events: {
    title: 'Evenemang',
    lead: 'Föreläsningar, marknader och öppet hus i Kvirnby.',
    upcoming: 'Kommande evenemang',
    past: 'Tidigare evenemang',
    cancelledWord: 'Inställt: ',
    cancelledTitle: 'Evenemanget är inställt',
    cancelledBody: 'Evenemanget blir inte av. Se de andra evenemangen för vad som är på gång.',
    endedBody: 'Evenemanget har varit. Se de andra evenemangen för vad som är på gång.',
    when: 'När',
    where: 'Var',
    cost: 'Kostnad',
    accessibility: 'Tillgänglighet',
    organiser: 'Arrangör',
    to: 'till',
    book: 'Boka plats',
    all: 'Alla evenemang',
    items: [
      {
        slug: 'open-house-hillside',
        title: 'Öppet hus på förskolan Hillside',
        status: 'upcoming',
        startsAt: '2026-10-21T16:00:00Z',
        endsAt: '2026-10-21T18:00:00Z',
        place: ['Förskolan Hillside', 'Gamla kvarnvägen 12', '123 45 Kvirnby'],
        cost: 'Gratis',
        access: 'Entré utan trösklar med automatisk dörr. Hörselslinga i salen.',
        organiser: 'Förskolan Hillside',
        summary: 'Se grupperna, trädgården och köket och träffa personalen.',
        description:
          'Kom och se grupperna, trädgården och köket och träffa personalen. Du kan fråga om platser till vårterminen.',
      },
      {
        slug: 'autumn-lecture',
        title: 'Höstföreläsning: Kvirnbys historia',
        status: 'upcoming',
        startsAt: '2026-11-04T17:00:00Z',
        endsAt: '2026-11-04T18:30:00Z',
        place: ['Huvudbiblioteket', 'Storgatan 4', '123 45 Kvirnby'],
        cost: 'Gratis',
        access:
          'Entré utan trösklar. Hörselslinga i föreläsningssalen. Föredraget sänds också med textning.',
        organiser: 'Kvirnby bibliotek',
        summary: 'En lokalhistoriker berättar hur staden växte fram kring kvarnen.',
        description:
          'En lokalhistoriker berättar hur staden växte fram kring kvarnen. Efteråt finns tid för frågor.',
      },
      {
        slug: 'family-day',
        title: 'Familjedag i simhallen',
        status: 'cancelled',
        startsAt: '2026-11-15T09:00:00Z',
        endsAt: '2026-11-15T13:00:00Z',
        place: ['Kvirnby simhall', 'Badvägen 2', '123 45 Kvirnby'],
        cost: 'Gratis',
        access: 'Entré utan trösklar. Hiss till omklädningsrummen och badlift.',
        organiser: 'Kultur och fritid',
        summary: 'Lekar och gratis simning för hela familjen.',
        description: 'Lekar och gratis simning för hela familjen.',
      },
      {
        slug: 'harvest-market',
        title: 'Skördemarknad på torget',
        status: 'ended',
        startsAt: '2026-09-23T16:00:00Z',
        endsAt: '2026-09-23T18:00:00Z',
        place: ['Torget', 'Storgatan', '123 45 Kvirnby'],
        cost: 'Gratis',
        access: 'Jämnt underlag. Tillgängliga toaletter i stadshuset.',
        organiser: 'Näringsliv och arbete',
        summary: 'Lokala odlare och bagare sålde det säsongen gav.',
        description: 'Lokala odlare och bagare sålde det säsongen gav.',
      },
    ],
  },
}

export const referenceNewsMessages = { sv, en }
