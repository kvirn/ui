'use client'
import { Heading } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

/** Four people, one band each. The first carries the id the hero's "Who it's for" link points at. */
export function Moments() {
  return (
    <>
      {homeMessages.moments.map((moment, index) => (
        <Band
          key={moment.id}
          tone={index % 2 === 0 ? 'surface' : 'canvas'}
          className="home-moment"
          id={index === 0 ? 'who' : undefined}
        >
          <div className="home-moment-grid" data-flip={index % 2 === 1 ? '' : undefined}>
            <img
              className="home-photo"
              src={moment.image}
              width={moment.width}
              height={moment.height}
              alt={moment.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div>
              <Heading as="h2" size="heading-1" className="home-moment-heading">
                {moment.heading}
              </Heading>
              <p className="home-moment-body">{moment.body}</p>
              <p className="home-moment-so">{moment.so}</p>
            </div>
          </div>
        </Band>
      ))}
    </>
  )
}
