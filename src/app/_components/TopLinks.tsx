import React from 'react';
import Link from 'next/link';
import { Button } from "@nextui-org/react";
import { api } from '~/trpc/server';

const TopLinks = async () => {
  const links = await api.friendLink.getTopLinks();

  return (
      <div className="mx-auto w-full px-4 py-2">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {links.map((link) => (
            <Link href={link.url} key={link.id}>
              <Button 
                color="primary" 
                variant="flat"
                className="flex size-full flex-col items-center justify-center p-2"
                target="_blank"
              >
                <span className="text-center text-xs sm:text-sm">{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
  );
};

export default TopLinks;