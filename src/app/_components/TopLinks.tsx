import React from 'react';
import { api } from '~/trpc/server';
import TrackableLink from './Trackable/TrackableLink';
import { type FriendLink } from '@prisma/client';

const TopLinks = async () => {
  const links = await api.friendLink.getTopLinks();

  return (
    <div className="mx-auto w-full p-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {links.map((link: FriendLink) => (
          <TrackableLink key={link.id} href={link.url} name={link.name} />
        ))}
      </div>
    </div>
  );
};

export default TopLinks;