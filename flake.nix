{
  description = "Flake for an existing Node.js project";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      pkgs = import nixpkgs { system = "x86_64-linux"; };
    in
    {
      packages.x86_64-linux.default = pkgs.buildNpmPackage {
        src = ./.;
        nodejs = pkgs.nodejs-18_x;
      };

      # Optional: add a devShell for a development environment
      devShells.x86_64-linux.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs-18_x
          pkgs.yarn
        ];
      };

      defaultPackage.x86_64-linux = self.packages.x86_64-linux.default;
    };
}

