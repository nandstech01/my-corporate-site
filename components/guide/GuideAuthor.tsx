import Image from 'next/image'
import { Phrases } from './phrases'

interface GuideAuthorProps {
  readonly name: string
  readonly role: string
  readonly organization: string
  readonly bio: string
  /** 著者ページ (サイト内のパス) */
  readonly href: string
  readonly image: string
  /** 本人の外部アカウント (site-entities の AUTHOR.profiles) */
  readonly profiles: ReadonlyArray<{ readonly label: string; readonly url: string }>
}

/** ガイドの末尾の「書いた人」。通常の記事の著者欄と同じ id (author-profile) */
export default function GuideAuthor({ name, role, organization, bio, href, image, profiles }: GuideAuthorProps) {
  return (
    <section className="guide-band guide-section guide-author" id="author-profile" aria-labelledby="guide-author-title">
      <div className="guide-frame guide-grid">
        <div className="guide-rail">
          <p className="guide-rail__label">書いた人</p>
        </div>
        <div className="guide-main guide-author__main">
          <Image className="guide-author__photo" src={image} alt={name} width={80} height={80} unoptimized />
          <div className="guide-author__text">
            <p id="guide-author-title" className="guide-author__name">
              <a href={href} rel="author">
                {name}
              </a>
            </p>
            <p className="guide-author__role">
              <Phrases text={`${organization} ${role}`} />
            </p>
            <p className="guide-author__bio">
              <Phrases text={bio} />
            </p>
            <ul className="guide-author__links">
              {profiles.map((profile) => (
                <li key={profile.url}>
                  <a href={profile.url} target="_blank" rel="noopener noreferrer me">
                    {profile.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={href}>詳しいプロフィール</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
