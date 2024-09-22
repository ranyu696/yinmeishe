// components/TrackableLink.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@nextui-org/react";
import posthog from 'posthog-js'; // 确保你已经在客户端初始化了 posthog-js

interface TrackableLinkProps {
  href: string;
  name: string;
}

const TrackableLink: React.FC<TrackableLinkProps> = ({ href, name }) => {
  const handleClick = () => {
    posthog.capture('clicked_top_link', {
      link_name: name,
      link_url: href
    });
  };

  return (
    <Link href={href} onClick={handleClick}>
      <Button 
        color="primary" 
        variant="flat"
        className="flex size-full flex-col items-center justify-center p-2"
        target="_blank"
      >
        <span className="text-center text-xs sm:text-sm">{name}</span>
      </Button>
    </Link>
  );
};

export default TrackableLink;