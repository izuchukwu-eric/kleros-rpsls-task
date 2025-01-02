import React from 'react';

type ExplorerLinkProps = {
  hashOrAddress: string;
  isAddress?: boolean;
};

const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  hashOrAddress,
  isAddress = false,
}) => {
  const baseUrl = 'https://sepolia.etherscan.io';

  const link = !isAddress
    ? `${baseUrl}/tx/${hashOrAddress}`
    : `${baseUrl}/address/${hashOrAddress}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {hashOrAddress}
    </a>
  );
};

export default ExplorerLink;