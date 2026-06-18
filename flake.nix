{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
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
          python = pkgs.python312.withPackages (
            ps: with ps; [
              alembic
              fastapi
              httpx
              pydantic
              pytest
              ruff
              sqlalchemy
              uvicorn
            ]
          );
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_22
              pnpm
              python
            ];

            env = {
              NEXT_TELEMETRY_DISABLED = "1";
              PYTHONDONTWRITEBYTECODE = "1";
              PYTHONUNBUFFERED = "1";
            };

          };
        }
      );

      formatter = forAllSystems ({ pkgs }: pkgs.nixfmt);
    };
}
