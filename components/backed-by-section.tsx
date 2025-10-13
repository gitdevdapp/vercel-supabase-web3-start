import { DemoContentBadge } from "./demo-content-badge";

export function BackedBySection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header Content */}
        <div className="text-center mb-12">
          <DemoContentBadge 
            message="Replace with Your Investors & Partners" 
            variant="info"
          />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 mt-6">
            Your Investors & Partners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This section is a placeholder. Add your investors, partners, or remove this section entirely.
          </p>
        </div>

        {/* Placeholder Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div 
              key={i} 
              className="aspect-square w-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors"
            >
              <span className="text-muted-foreground font-semibold">Logo {i}</span>
            </div>
          ))}
        </div>

        {/* Demo Note */}
        <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          <p>
            💡 <strong>Tip:</strong> Remove this section or update it with your actual investors, 
            foundation partners, or ecosystem supporters. You can also transform it into a 
            &quot;Supported Chains&quot; section showcasing blockchain networks you integrate with.
          </p>
        </div>
      </div>
    </section>
  );
}
