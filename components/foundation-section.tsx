import { Zap, TrendingUp, Heart } from "lucide-react";

export function FoundationSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            For Blockchain Foundations
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This template helps developers build production apps on your chain at zero cost. More deployed apps increases developer activity and improves ecosystem metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Free Infrastructure</h3>
            <p className="text-muted-foreground">
              Developers can deploy production apps using Vercel and Supabase free tiers. No infrastructure costs to start building.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Increase Developer Activity</h3>
            <p className="text-muted-foreground">
              More deployed applications increase active developer counts. Easier development tools lead to more ecosystem growth.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Open Source Template</h3>
            <p className="text-muted-foreground">
              Free to use and modify. Support for your blockchain can be added or customized as needed.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
