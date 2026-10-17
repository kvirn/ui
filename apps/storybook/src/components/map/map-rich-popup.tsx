import { Map, useMapState } from '@kvirn-ui/map'
import type { MapPlace } from '@kvirn-ui/map'
import { Icon } from '@kvirn-ui/react'
import type { ReactElement } from 'react'
import { useProvider } from './map.fixture.tsx'
import type { MapDemoProps } from './map.fixture.tsx'
import './map-rich-popup.css'

// CustomPopup: everything a place page would show, in the popup. The facts the parts don't cover
// (category, rating, opening hours, facilities, links) live in `place.data` and are read back
// with `useMapState`.

interface Venue {
  category: string
  rating: number
  reviews: number
  openUntil: string | null
  facilities: readonly string[]
  website: string
}

// Inline SVG illustrations: the story requests no image from a third party.
function illustration(sky: [string, string], scene: string, alt: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="320" height="180" fill="url(#s)"/>${scene}</svg>`
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt }
}

const skyline =
  '<circle cx="250" cy="62" r="26" fill="#ffd27a"/><path d="M0 180V118h28V96h22v22h18V84h30v34h16V70l20-16 20 16v48h18V92h26v26h22V100h24v18h20V88h28v30h28v62z" fill="#26324a"/><path d="M0 150h320v30H0z" fill="#2f5d7c"/><path d="M0 156h320M0 166h320" stroke="#7fb2cf" stroke-width="2" stroke-dasharray="14 10"/>'
const lakeside =
  '<path d="M0 120c60-30 120-34 180-18s100 10 140-4v82H0z" fill="#3e7a52"/><path d="M0 146c80-14 160-14 320 0v34H0z" fill="#4a8db5"/><path d="M60 120l18-46 18 46zM90 124l14-34 14 34zM230 112l16-40 16 40z" fill="#244d33"/><rect x="150" y="98" width="46" height="26" fill="#f4efe6"/><path d="M146 100l27-20 27 20z" fill="#b5452f"/>'
const square =
  '<rect x="0" y="120" width="320" height="60" fill="#d9c7a3"/><path d="M30 120V60h70v60zM120 120V40h80v80zM220 120V70h70v50z" fill="#c2593f"/><path d="M40 72h12v14H40zM66 72h12v14H66zM132 54h14v16h-14zM158 54h14v16h-14zM180 54h12v16h-12zM232 82h12v14h-12zM258 82h12v14h-12z" fill="#fbe3b5"/><circle cx="160" cy="150" r="12" fill="#7a5a3a"/><path d="M152 150h16" stroke="#fbe3b5" stroke-width="3"/>'

const venues: MapPlace<Venue>[] = [
  {
    id: 'strand',
    name: 'Quayside Hotel',
    address: 'Strand Road 7, 114 56 Stockholm',
    description:
      'Rooms over the water on the city’s grandest boulevard, a short walk from the Royal Dramatic Theatre and the ferries to the archipelago.',
    image: illustration(
      ['#f7a26b', '#f6d8a8'],
      skyline,
      'The waterfront at sunset, with a row of stone buildings',
    ),
    position: { longitude: 18.081, latitude: 59.332 },
    data: {
      category: 'Hotel',
      rating: 4.7,
      reviews: 1284,
      openUntil: null,
      facilities: ['Breakfast', 'Wi-Fi', 'Sauna', 'Step-free entrance'],
      website: 'https://example.com/strandkajen',
    },
  },
  {
    id: 'malaren',
    name: 'Lakeshore Café',
    address: 'North Lakeshore 64, 112 35 Stockholm',
    description:
      'Cinnamon buns baked every morning and a terrace on the lake shore. Prams and wheelchairs fit through the side door.',
    image: illustration(
      ['#8fc8e8', '#e3f1f8'],
      lakeside,
      'A red-roofed café among trees by a lake',
    ),
    position: { longitude: 18.031, latitude: 59.326 },
    data: {
      category: 'Café',
      rating: 4.4,
      reviews: 312,
      openUntil: '18:00',
      facilities: ['Terrace', 'Accessible toilet', 'Vegan options'],
      website: 'https://example.com/malarstrand',
    },
  },
  {
    id: 'torget',
    name: 'Market Hall',
    address: 'Citizens Square 3, 118 72 Stockholm',
    description: 'A food hall with twenty stalls, from smoked fish to Ethiopian coffee.',
    image: illustration(
      ['#f3c98b', '#fbecd0'],
      square,
      'Red brick market buildings around a square',
    ),
    position: { longitude: 18.072, latitude: 59.314 },
    data: {
      category: 'Food hall',
      rating: 4.5,
      reviews: 2041,
      openUntil: '21:00',
      facilities: ['Wi-Fi', 'Baby changing', 'Step-free entrance'],
      website: 'https://example.com/saluhall',
    },
  },
  {
    id: 'kiosk',
    name: 'Kiosk Ice Cream',
    address: 'Ralambshov Park, 112 59 Stockholm',
    position: { longitude: 18.017, latitude: 59.329 },
    data: {
      category: 'Ice cream',
      rating: 4.2,
      reviews: 87,
      openUntil: '20:00',
      facilities: [],
      website: 'https://example.com/kiosk',
    },
  },
]

function useVenue(): MapPlace<Venue> | null {
  return useMapState<Venue>().selectedPlace
}

// Over the image when there is one, else first in the facts row.
function VenueBadge({ onImage }: { onImage: boolean }): ReactElement | null {
  const venue = useVenue()
  if (!venue?.data || Boolean(venue.image) !== onImage) {
    return null
  }
  return (
    <span className={onImage ? 'kv-badge story-rich-popup-badge' : 'kv-badge'}>
      {venue.data.category}
    </span>
  )
}

function VenueFacts(): ReactElement | null {
  const venue = useVenue()
  if (!venue?.data) {
    return null
  }
  const { rating, reviews, openUntil } = venue.data
  const stars = '★★★★★'.slice(0, Math.round(rating)).padEnd(5, '☆')
  return (
    <p className="story-rich-popup-facts">
      <VenueBadge onImage={false} />
      <span className="story-rich-popup-stars" aria-hidden="true">
        {stars}
      </span>
      <span>
        <span className="kv-visually-hidden">Rated </span>
        {rating.toFixed(1)}
        <span className="kv-visually-hidden"> out of 5</span> ({reviews.toLocaleString('en')}{' '}
        reviews)
      </span>
      {openUntil ? (
        <span className="kv-badge kv-badge--success">Open until {openUntil}</span>
      ) : null}
    </p>
  )
}

function VenueFacilities(): ReactElement | null {
  const venue = useVenue()
  const facilities = venue?.data?.facilities ?? []
  if (facilities.length === 0) {
    return null
  }
  return (
    <ul className="story-rich-popup-tags" aria-label="Facilities">
      {facilities.map((facility) => (
        <li key={facility} className="kv-tag">
          {facility}
        </li>
      ))}
    </ul>
  )
}

function VenueActions(): ReactElement | null {
  const venue = useVenue()
  if (!venue?.data) {
    return null
  }
  const { latitude, longitude } = venue.position
  return (
    <div className="story-rich-popup-actions">
      <a
        className="kv-button kv-button--primary"
        href={`https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`}
      >
        <Icon name="arrow-forward" size="16" />
        Directions
      </a>
      <a className="kv-button" href={venue.data.website}>
        Website
      </a>
    </div>
  )
}

export function RichPopupDemo({ offline = false, ...mapProps }: MapDemoProps): ReactElement {
  const provider = useProvider(offline)
  return (
    <Map.Root
      provider={provider}
      {...mapProps}
      places={venues}
      initialView={{ center: { longitude: 18.05, latitude: 59.324 }, zoom: 12 }}
      cluster={false}
      className="story-rich-popup-map"
    >
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.List />
      <Map.Details className="story-rich-popup">
        <div className="story-rich-popup-media">
          <Map.DetailsImage />
          <VenueBadge onImage />
        </div>
        <div className="kv-map-details-content">
          <Map.DetailsTitle />
          <Map.DetailsClose />
          <VenueFacts />
          <Map.DetailsBody />
          <VenueFacilities />
          <Map.DetailsAddress />
        </div>
        <div className="kv-map-details-footer">
          <VenueActions />
        </div>
      </Map.Details>
    </Map.Root>
  )
}
