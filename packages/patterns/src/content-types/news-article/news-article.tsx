'use client'

import { Breadcrumb, Container, Heading, Link, List, Prose, Stack } from '@kvirn-ui/react'
import { useRef } from 'react'
import { kvirnbyHills } from '../../fixtures/images.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'
import { NewsDate } from '../news-list/news-date.tsx'

export interface NewsArticleProps {
  /** `updated` adds the date of the change after the date of publication. Default `published`. */
  state?: 'published' | 'updated' | undefined
  /** `false` leaves out the figure. Default `true`. */
  image?: boolean | undefined
}

/**
 * One news item, the slot between header and footer: breadcrumb, `h1`, dates, read aloud, preamble,
 * figure, prose, related news and page tools. Example text is English and fictional (Kvirnby
 * municipality).
 */
export function NewsArticle({ state = 'published', image = true }: NewsArticleProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#news">News</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Roadworks on Storgatan</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-2">
            <Heading as="h1">Roadworks on Storgatan until the end of November</Heading>
            <p>
              Published <NewsDate isoDate="2026-10-09" />
              {state === 'updated' ? (
                <>
                  . Updated <NewsDate isoDate="2026-10-12" />
                </>
              ) : null}
            </p>
          </Stack>
          <PageTools.Top contentRef={contentRef} />
          <div ref={contentRef}>
            <Stack className="kv-stack--gap-8">
              <p className="kv-lead">
                Storgatan is being rebuilt between the square and Skolvägen. Buses are diverted and
                walking and cycling routes stay open.
              </p>
              {image ? (
                <Prose>
                  <figure>
                    <img
                      src={kvirnbyHills}
                      alt="Storgatan seen from the square, with the road narrowed to one lane."
                    />
                    <figcaption>Storgatan on 9 October. Photo: Kvirnby municipality.</figcaption>
                  </figure>
                </Prose>
              ) : null}
              <Prose>
                <h2>What changes</h2>
                <p>
                  Only one lane is open at a time, with traffic lights. Buses 3 and 7 use Skolvägen
                  and stop at the temporary stops marked on the map at the town hall.
                </p>
                <h2>When it is finished</h2>
                <p>
                  The work is planned to finish on 30 November. If the weather delays it, we will
                  tell you here.
                </p>
              </Prose>
            </Stack>
          </div>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3" id="related-news">
              Related news
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link.Root href="#news-parking">Winter parking rules start on 1 November</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#news-recycling">
                  The recycling centre opens an hour earlier on Saturdays
                </Link.Root>
              </List.Item>
            </List.Root>
          </Stack>
          <PageTools.Root>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
