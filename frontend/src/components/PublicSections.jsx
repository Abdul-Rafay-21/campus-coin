/** Photo-led building blocks shared by the public website pages. */
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export function SpotlightRow({
  image,
  alt,
  chip,
  chipIcon: ChipIcon,
  kicker,
  title,
  text,
  points = [],
  link,
  reverse = false,
}) {
  return (
    <article className={`spotlight-row ${reverse ? "reverse" : ""}`}>
      <div className="spotlight-media">
        <img src={image} alt={alt} loading="lazy" />
        {chip && (
          <span className="spotlight-chip">
            {ChipIcon && <ChipIcon size={15} />} {chip}
          </span>
        )}
      </div>
      <div className="spotlight-copy">
        <span className="section-kicker">{kicker}</span>
        <h3>{title}</h3>
        <p>{text}</p>
        {points.length > 0 && (
          <ul>
            {points.map((point) => (
              <li key={point}>
                <Check size={15} /> {point}
              </li>
            ))}
          </ul>
        )}
        {link && (
          <Link className="inline-link" to={link[0]}>
            {link[1]} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}

export function PhotoTile({ image, alt, tag, title, text, to, cta, compact }) {
  const className = `photo-tile ${compact ? "compact" : ""}`;
  const body = (
    <>
      <img src={image} alt={alt} loading="lazy" />
      {tag && <span className="photo-tile-tag">{tag}</span>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {cta && (
        <span className="photo-tile-link">
          {cta} <ArrowRight size={14} />
        </span>
      )}
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <article className={className}>{body}</article>
  );
}
