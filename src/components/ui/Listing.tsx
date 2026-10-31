import React from "react";

export interface ListingProps extends React.HTMLAttributes<HTMLDivElement> {
  identity: React.ReactNode;
  terms: React.ReactNode;
  details: React.ReactNode;
  featured?: boolean;
  featuredLabel?: string;
  className?: string;
}

export const Listing: React.FC<ListingProps> = ({
  identity,
  terms,
  details,
  featured = false,
  featuredLabel = "Featured",
  className = "",
  ...props
}) => {
  return (
    <article
      className={`np-listing ${featured ? "is-featured" : ""} ${className}`.trim()}
      {...props}
    >
      <div className="np-listing-column np-listing-identity">
        {featured && (
          <div className="np-listing-featured-label" aria-label="Featured item">
            <span className="np-listing-featured-marker" aria-hidden="true" />
            <span>{featuredLabel}</span>
          </div>
        )}
        <div className="np-listing-identity-body">{identity}</div>
      </div>
      <div className="np-listing-column np-listing-terms">{terms}</div>
      <div className="np-listing-column np-listing-details">{details}</div>
    </article>
  );
};

export default Listing;

