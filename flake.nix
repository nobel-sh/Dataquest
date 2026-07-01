{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];

      forAllSystems =
        function:
        nixpkgs.lib.genAttrs systems (
          system:
          function {
            pkgs = import nixpkgs {
              inherit system;
              config.allowUnfree = true;
            };
          }
        );
    in
    {
      devShells = forAllSystems (
        { pkgs }:
        let
          system = pkgs.stdenv.hostPlatform.system;
          python = pkgs.python312.withPackages (
            ps: with ps; [
              alembic
              fastapi
              httpx
              pydantic
              psycopg
              pytest
              ruff
              sqlalchemy
              uvicorn
            ]
          );
        in
        {
          frontend = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_22
              pnpm
            ];

            env = {
              NEXT_TELEMETRY_DISABLED = "1";
            };
          };

          backend = pkgs.mkShell {
            packages = with pkgs; [
              docker-compose
              postgresql_16
              python
              sqlite
            ];

            env = {
              PYTHONDONTWRITEBYTECODE = "1";
              PYTHONUNBUFFERED = "1";
            };
          };

          default = pkgs.mkShell {
            inputsFrom = [
              self.devShells.${system}.frontend
              self.devShells.${system}.backend
            ];
          };
        }
      );

      formatter = forAllSystems ({ pkgs }: pkgs.nixfmt);
    };
}
