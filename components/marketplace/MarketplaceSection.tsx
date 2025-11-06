"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, TrendingUp, Zap } from "lucide-react";

interface NFTItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  collection: string;
}

const mockNFTs: NFTItem[] = [
  {
    id: "1",
    name: "Cosmic Explorer",
    description: "A rare NFT representing space exploration",
    price: "0.05 ETH",
    image: "/images/1.png",
    rarity: "Rare",
    collection: "Space Collection"
  },
  {
    id: "2",
    name: "Digital Phoenix",
    description: "Legendary NFT with rebirth mechanics",
    price: "0.12 ETH",
    image: "/images/2.png",
    rarity: "Legendary",
    collection: "Mythical Collection"
  },
  {
    id: "3",
    name: "Neon Warrior",
    description: "Epic NFT for gaming enthusiasts",
    price: "0.08 ETH",
    image: "/images/3.png",
    rarity: "Epic",
    collection: "Gaming Collection"
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common": return "bg-gray-500";
    case "Rare": return "bg-blue-500";
    case "Epic": return "bg-purple-500";
    case "Legendary": return "bg-orange-500";
    default: return "bg-gray-500";
  }
};

export function MarketplaceSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h2 className="text-3xl lg:text-4xl font-bold">NFT Marketplace</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover, buy, and sell unique digital assets in our decentralized marketplace.
            Connect your wallet to start trading NFTs securely.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <Star className="w-8 h-8 text-yellow-500" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <p className="text-2xl font-bold">856</p>
              <p className="text-sm text-muted-foreground">NFTs Listed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <Zap className="w-8 h-8 text-purple-500" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured NFTs */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Featured NFTs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockNFTs.map((nft) => (
              <Card key={nft.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} text-white`}
                    >
                      {nft.rarity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {nft.collection}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">{nft.name}</CardTitle>
                  <CardDescription className="text-sm mb-4">
                    {nft.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{nft.price}</span>
                    <Button size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="px-8">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Explore Full Marketplace
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Connect your wallet to view all available NFTs and collections
          </p>
        </div>
      </div>
    </section>
  );
}
